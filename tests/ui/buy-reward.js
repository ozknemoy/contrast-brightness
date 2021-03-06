/**
 * Created by ozknemoy on 31.12.2016.
 */

const vars = require('./vars');
const EC = protractor.ExpectedConditions;

describe('покупка награды/', function () {
    let local_url=vars.local_url_reward,
        email_adress,email,email2,
        notLoginOuterButton,is_notLoginOuterButton,
        forLoginInnerButton,is_forLoginInnerButton,
        checkboxReward,_checkboxRewardHolder,
        checkboxFromCAccount,is_checkboxFromCAccount,
        _checkboxFromCAccountHolder
        ;
    beforeEach(function () {
        email_adress = Math.floor(Math.random()*10e8) + '@tail.ru';
        browser.get(vars.baseUrl + local_url);
        email = element(by.model('rl.email'));
        email2 = element(by.model('rl.emailTwo'));
        <!-- для внешнего счета логинов и для неавторизованых -->
        notLoginOuterButton = $('[data-hook="notLoginOuterButton"]');
        is_notLoginOuterButton = notLoginOuterButton.isPresent();
        <!-- для внутреннего счета логина-->
        forLoginInnerButton = $('[data-hook="forLoginInnerButton"]');
        is_forLoginInnerButton = forLoginInnerButton.isPresent();
        // чекбокс
        checkboxReward = $('[data-hook="checkboxReward"]');
        _checkboxRewardHolder = $('[data-hook="_checkboxReward"]');
        // чекбокс достаточно денег и холдер
        checkboxFromCAccount = $('[data-hook="checkboxFromCAccount"]');
        is_checkboxFromCAccount = checkboxFromCAccount.isPresent();
        _checkboxFromCAccountHolder = $('[data-hook="_checkboxFromCAccount"]');


    });
    /*afterEach(()=>{
        browser.restart()
    });*/

    // при запуске отделять 1 тест от остальных двух
    describe('без логина/', function () {
        it(' через шлюз',function () {
            // какие из кнопок показываются
            expect(is_notLoginOuterButton).toBe(true);
            expect(is_forLoginInnerButton).toBe(false);
            _checkboxRewardHolder.click();
            expect(checkboxReward.isSelected()).toBeTruthy();
            email.sendKeys(email_adress);
            email2.sendKeys(email_adress);
            notLoginOuterButton.click();
            browser.getCurrentUrl().then(function (url) {
                // url должен содержать адрес шлюза а не локальный
                //  он должен содержать и адрес возврата
                expect(/secure\.onpay\.ru/i.test(url) && !/localhost/i.test(url)).toBe(true);
            });
        });
        it('проверка (не)доступности кнопки отправить ',function () {
            //expect(browser.getCurrentUrl()).toBe(vars.baseUrl + local_url);

            expect(notLoginOuterButton.getAttribute('disabled')).toBe('true');
            // жму чекбокс и снова проверяю
            _checkboxRewardHolder.click();
            expect(checkboxReward.isSelected()).toBeTruthy();
            expect(notLoginOuterButton.getAttribute('disabled')).toBe('true');
            email.sendKeys(vars.userName);
            //недобирю одну букву   //'ozk.nemoy@mail.r'
            email2.sendKeys(vars.userName.slice(0,-1));
            expect(notLoginOuterButton.getAttribute('disabled')).toBe('true');
            // + последняя буква
            email2.sendKeys(vars.userName.slice(-1));
            // снимается дисейбл только при условиях выше
            expect(notLoginOuterButton.getAttribute('disabled')).toBe(null);
        });
        it('под существующее мыло  ',function () {
            _checkboxRewardHolder.click();
            email.sendKeys(vars.userName);
            email2.sendKeys(vars.userName);
            // выключил асинхронность изза ng-toast
            browser.ignoreSynchronization = true;
            notLoginOuterButton.click();

            // редиректа не должно быть
            expect(browser.getCurrentUrl()).toBe(vars.baseUrl + local_url);
            /*browser.getCurrentUrl().then(function (url) {
             console.log("qqqqqqqqqqqqqqqqqqqqqqq",url);
             // url должен содержать только локальный адрес!/secure\.onpay\.ru/i.test(url) &&

             expect( /localhost/i.test(url)).toBe(true);
             });*/
            // проверяю что есть danger тост и нет success тост
            browser.wait(
                EC.and(
                    EC.presenceOf($('.ng-toast__list .alert-danger')),
                    EC.stalenessOf($('.ng-toast__list .alert-success'))
                ), 500);
            // решает проблемы связанности сессий
            browser.restart()
        });
    });
    describe('под логином /', function () {
        /*afterEach(function() {
            browser.executeScript('window.sessionStorage.clear();');
            browser.executeScript('window.localStorage.clear();');
        });*/
        it(`нулевого счета ${vars.userName}.(не)доступность кнопки отправить + отправка на шлюз`,function () {
            $('login-button').click();
            $('#login_username').sendKeys(vars.userName);
            $('#login_password').sendKeys(vars.password,protractor.Key.ENTER);

            // нет чекбокса внутреннего аккаунта
            expect(is_checkboxFromCAccount).toBe(false);

            expect(notLoginOuterButton.getAttribute('disabled')).toBe('true');
            // чекбокс false
            expect(checkboxReward.isSelected()).toBe(false);
            // жму чекбокс и снова проверяю
            _checkboxRewardHolder.click();
            expect(checkboxReward.isSelected()).toBe(true);
            expect(notLoginOuterButton.getAttribute('disabled')).toBe(null);
            // иду на шлюз
            notLoginOuterButton.click();
            browser.getCurrentUrl().then(function (url) {
                // url должен содержать адрес шлюза а не локальный
                //  он должен содержать и адрес возврата
                expect(/secure\.onpay\.ru/i.test(url) && !/localhost/i.test(url)).toBe(true);
            });
            //browser.restart()

        });
    });
    describe('под логином/', function () {

        it('счета с деньгами ' + vars.userNameG + ' покупка со шлюза',()=>{
            // сначала выходим с прошлого логина
            $('[data-hook="open-logout"]').click();
            $('[data-hook="logout"]').click();


            $('login-button').click();
            $('#login_username').sendKeys(vars.userNameG);
            $('#login_password').sendKeys(vars.password,protractor.Key.ENTER);


            // кнопки оплаты со своего счета не должно быть
            expect(is_forLoginInnerButton).toBe(false);

            // снимаем чекбокс с оплаты с внутр счета
            _checkboxRewardHolder.click();

            // есть чекбокс внутреннего аккаунта
            expect(checkboxFromCAccount.isSelected()).toBe(true);

            _checkboxFromCAccountHolder.click();

            // теперь он не активен
            expect(checkboxFromCAccount.isSelected()).toBe(false);


            // теперь кнопки подменились и      тупит...
            //expect(forLoginInnerButton.isPresent()).toBe(true);
            //expect(notLoginOuterButton.isPresent()).toBe(false);

            notLoginOuterButton.click();
            browser.getCurrentUrl().then(function (url) {
                // url должен содержать адрес шлюза а не локальный
                //  он должен содержать и адрес возврата
                expect(/secure\.onpay\.ru/i.test(url) && !/localhost/i.test(url)).toBe(true);
            });
        });

        it('счета с деньгами ' + vars.userNameG + ' покупка с внутреннего счета',()=>{
            // мы должны быть под логином
            // поэтому просто ставим чекбокс и отправить
            _checkboxRewardHolder.click();
            forLoginInnerButton.click();
            browser.ignoreSynchronization = true;

            // ждем success тост

            // проверяю что есть danger тост и нет success тост
            browser.wait(
                EC.and(
                    EC.stalenessOf($('.ng-toast__list .alert-danger')),
                    EC.presenceOf($('.ng-toast__list .alert-success'))
                ), 500);

        })
    });
});