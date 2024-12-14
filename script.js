let Context = '';
let TimeStart = 0;
let Area = 'title';
let SpawnCostumers = null;
let Information = {
    money: 0,
    ratings: 0,
    costumerIndex: -1,
    strikes: 0,
    cutscene: false,
}

function GetTime(){
    let x = new Date();
    return x.getTime();
}

function Main(){Canvas.initialize();}

function Element(element){return document.getElementById(element);}

function ExtractCoordinates(position, part){
    let parts = ['x', 'y']
    if(parts.indexOf(part.toLowerCase()) === 0){
        return(Number(position.slice(0, position.indexOf(','))));
    }else if (parts.indexOf(part.toLowerCase()) === 1){
        return(Number(position.slice(position.indexOf(',') + 1, position.length)));
    }
}

function CreateSprites(x, y, angle, VelX, VelY, VelA, AccelX, AccelY, AccelA, img, opacity, w, h, scale, XFlip, YFlip, type){
    this.X = x;
    this.Y = y;
    this.angle = angle;
    this.VelocityX = VelX;
    this.VelocityY = VelY;
    this.VelocityAngle = VelA;
    this.AccelerationX = AccelX;
    this.AccelerationY = AccelY;
    this.AccelerationAngle = AccelA;
    this.image = new Image();
    this.image.src = 'Pictures/' + img + '.png';
    this.originalWidth = this.image.width;
    this.originalHeight = this.image.height;
    this.opacity = opacity;
    this.width = w;
    this.height = h;
    this.scale = scale;
    this.MirrorX = XFlip;
    this.MirrorY = YFlip;
    this.type = type;
    this.draw = function(){
        Context.save();
        Context.translate(this.X, this.Y);
        Context.rotate(Math.PI / 180 * this.angle);
        Context.scale(this.scale * this.MirrorX, this.scale * this.MirrorY);
        Context.globalAlpha = this.opacity;
        Context.drawImage(this.image, this.width * -0.5, this.height * -0.5, this.width, this.height);
        Context.restore();
        Context.globalAlpha = 1;
    };
    this.updatePosition = function(){
        this.VelocityX += this.AccelerationX;
        this.VelocityY += this.AccelerationY;
        this.VelocityAngle += this.AccelerationAngle;
        this.X += this.VelocityX;
        this.Y += this.VelocityY;
        this.angle += this.VelocityAngle;
        this.HitBoxUpdate();
    };
    this.HitLeft = [];
    this.HitUp = [];
    this.HitRight = [];
    this.HitDown = [];
    this.HitBoxes = [this.HitLeft, this.HitUp, this.HitRight, this.HitDown];
    this.HitBoxUpdate = function(){
        while(this.HitLeft.length>0){
            this.HitLeft.splice(0,1);
        }
        while(this.HitUp.length>0){
            this.HitUp.splice(0,1);
        }
        while(this.HitRight.length>0){
            this.HitRight.splice(0,1);
        }
        while(this.HitDown.length>0){
            this.HitDown.splice(0,1);
        }
        for(let i = this.X-this.scale*this.width/2; i<this.X+this.scale*this.width/2; i++){
            this.HitUp.push(String(i+','+String(Number(Math.round(this.Y-this.scale*this.height/2)))));
            this.HitDown.push(String(i+','+String(Number(Math.round(this.Y+this.scale*this.height/2)))));
        }
        for(let i = this.Y-this.scale*this.height/2; i<this.Y+this.scale*this.height/2; i++){
            this.HitLeft.push(String(Number(Math.round(this.X-this.scale*this.width/2)))+','+i);
            this.HitRight.push(String(Number(Math.round(this.X+this.scale*this.width/2)))+','+i);
        }
        while(this.HitBoxes.length>0){
            this.HitBoxes.splice(0,1);
        }
        this.HitBoxes.push(this.HitLeft);
        this.HitBoxes.push(this.HitUp);
        this.HitBoxes.push(this.HitRight);
        this.HitBoxes.push(this.HitDown);
    };
}

let UserInput = {
    mouse: {
        X: 0,
        Y: 0,
        click: false,
        charged: false,
        update: function(e){
            let CanvasAttributes = Element('GameArea').getBoundingClientRect();
            UserInput.mouse.X = (e.pageX-CanvasAttributes.left)*Element('GameArea').width/(CanvasAttributes.right-CanvasAttributes.left);
            UserInput.mouse.Y = (e.pageY-CanvasAttributes.top)*Element('GameArea').height/(CanvasAttributes.bottom-CanvasAttributes.top);
        }
    },
    keys: {
        ArrowLeft: false,
        ArrowUp: false,
        ArrowRight: false,
        ArrowDown: false,
        space: false,
        KeyArray: [false, false, false, false],
        Keys: ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown',],
        update: function(){
            for(let i = 0; i< this.Keys.length; i++){
                this[this.Keys[i]] = this.KeyArray[i];
            }
        },
        changeArray: function(e, bool){
            if(UserInput.keys.Keys.indexOf(e) > -1){
                UserInput.keys.KeyArray[UserInput.keys.Keys.indexOf(e)] = bool;
            } else if(e === '') {
                UserInput.keys.space = bool;
            }
        },
    },
    initialize: function(){
        window.addEventListener('mousemove', function(e){UserInput.mouse.update(e);});
        window.addEventListener('mouseover', function(e){UserInput.mouse.update(e);});
        window.addEventListener("keydown", function(e){UserInput.keys.changeArray(e.key, true);});
        window.addEventListener('keyup', function(e){UserInput.keys.changeArray(e.key, false);});
        window.addEventListener('click', function(){
            UserInput.mouse.click = true;
            setTimeout(function () {
                UserInput.mouse.click = false;
            }, Canvas.IntervalTime);
        });
    },
}

let Canvas = {
    objects: [],//1 is ingredients
    Time: 0,
    IntervalTime : 10,
    interval: function(){
        this.Time = GetTime();
        let proceed = true;
        setInterval(function(){
            if(proceed){
                if(Area === 'title'){
                    proceed = false;
                    let go = true;
                    let section = 0;
                    let TitleArea = setInterval(function(){
                        if(go){
                            if(section === 0){
                                go = false;
                                let selected = false;
                                let DrawTitle = function (){
                                    Context.drawImage(Element('Title'), 0, 0, Element('GameArea').width, Element('GameArea').height);
                                    Context.font = '30px Arial black';
                                    Context.fillStyle = 'black';
                                    Context.textAlign = 'center';
                                    Context.fillText('DYLAN\'S DINER!', Element('GameArea').width/2, Element('GameArea').height/2 - 20);
                                    Context.font = '10px Arial black';
                                }
                                let interval = 0;
                                let fadeInterval = setInterval(function() {
                                    if (!Information.cutscene) {
                                        clearInterval(fadeInterval);
                                        let titleInterval = setInterval(function () {
                                            if (UserInput.mouse.click && !selected) {
                                                if ((Math.abs(Element('GameArea').width / 2 - UserInput.mouse.X) < 30) && (Math.abs(UserInput.mouse.Y - (Element('GameArea').height / 2 + 10)) < 15)) {
                                                    let intervalTime = 0;
                                                    selected = true;
                                                    let fadein = setInterval(function () {
                                                        intervalTime += Canvas.IntervalTime;
                                                        if(intervalTime <= 2000){
                                                            Canvas.clear();
                                                            DrawTitle();
                                                            Context.fillText('Start', Element('GameArea').width / 2, Element('GameArea').height / 2 + 20);
                                                        }
                                                        if (fade(intervalTime, 'in', 1000)) {
                                                            if(fade(intervalTime - 1000, 'same', 1000)){
                                                                go = true;
                                                                proceed = true;
                                                                Area = 'lobby';
                                                                for(let i = 0; i<Canvas.objects.length; i++){
                                                                    while(Canvas.objects[i].length > 0){
                                                                        Canvas.objects[i].splice(0, 1);
                                                                    }
                                                                }
                                                                clearInterval(titleInterval);
                                                                clearInterval(TitleArea);
                                                                clearInterval(fadein);
                                                            }
                                                        }
                                                    }, Canvas.IntervalTime);
                                                } else if ((Math.abs(Element('GameArea').width / 2 - UserInput.mouse.X) < 30) && (Math.abs(UserInput.mouse.Y - (Element('GameArea').height / 2 + 30)) < 15)) {
                                                    let intervalTime = 0;
                                                    selected = true;
                                                    Information.cutscene = true;
                                                    let fadein = setInterval(function () {
                                                        intervalTime += Canvas.IntervalTime;
                                                        if(intervalTime<= 1000){
                                                            Canvas.clear();
                                                            DrawTitle();
                                                            Context.fillText('Credits', Element('GameArea').width / 2, Element('GameArea').height / 2 + 40);
                                                        }
                                                        if (fade(intervalTime, 'in', 1000)) {
                                                            go = true;
                                                            section = 1;
                                                            selected = false;
                                                            Information.cutscene = true;
                                                            clearInterval(titleInterval);
                                                            clearInterval(fadein);
                                                        }
                                                    }, Canvas.IntervalTime);
                                                } else if ((Math.abs(Element('GameArea').width / 2 - UserInput.mouse.X) < 30) && (Math.abs(UserInput.mouse.Y - (Element('GameArea').height / 2 + 50)) < 15)) {
                                                    let intervalTime = 0;
                                                    selected = true;
                                                    let fadein = setInterval(function () {
                                                        intervalTime += Canvas.IntervalTime;
                                                        if(intervalTime <= 1000){
                                                            Canvas.clear();
                                                            DrawTitle();
                                                            Context.fillText('Tutorial', Element('GameArea').width / 2, Element('GameArea').height / 2 + 60);
                                                        }
                                                        if (fade(intervalTime, 'in', 1000)) {
                                                            go = true;
                                                            section = 2;
                                                            selected = false;
                                                            Information.cutscene = true;
                                                            clearInterval(titleInterval);
                                                            clearInterval(fadein);
                                                        }
                                                    }, Canvas.IntervalTime);
                                                }
                                            } else if (!selected) {
                                                Canvas.clear();
                                                DrawTitle();
                                                Context.fillText('Start', Element('GameArea').width / 2, Element('GameArea').height / 2 + 20);
                                                Context.fillText('Credits', Element('GameArea').width / 2, Element('GameArea').height / 2 + 40);
                                                Context.fillText('Tutorial', Element('GameArea').width / 2, Element('GameArea').height / 2 + 60);
                                            }
                                        }, Canvas.IntervalTime);
                                    }else{
                                        interval += Canvas.IntervalTime;
                                        if(interval <= 1000){
                                            Canvas.clear();
                                            DrawTitle();
                                        }
                                        if(fade(interval, 'out', 1000)){
                                            Information.cutscene = false;
                                        }
                                    }
                                }, Canvas.IntervalTime);
                            }else if(section === 1){
                                go = false;
                                let interval = 0;
                                let drawCredits = function(){
                                    Context.fillStyle = 'black';
                                    Context.font = '30px Arial black';
                                    Context.textAlign = 'center';
                                    Context.fillText('Credits', Element('GameArea').width / 2, 30);
                                    Context.font = '50px Arial black';
                                    Context.fillText('DYLAN JA', Element('GameArea').width / 2, Element('GameArea').height / 2 + 10)
                                };
                                let fadeInterval = setInterval(function(){
                                    if(!Information.cutscene) {
                                        clearInterval(fadeInterval);
                                        let creditsInterval = setInterval(function () {
                                            if((Information.cutscene && interval <= 1000) || !Information.cutscene){
                                                Canvas.clear();
                                                drawCredits();
                                                Context.font = '10px Arial black';
                                                Context.fillText('Back', Element('GameArea').width / 2, Element('GameArea').height - 20);
                                                if (UserInput.mouse.click && (Math.abs(Element('GameArea').width / 2 - UserInput.mouse.X) < 30) && (Math.abs(Element('GameArea').height - 20 - UserInput.mouse.Y) < 15)) {
                                                    interval = 0;
                                                    Information.cutscene = true;
                                                }
                                            }
                                            if(Information.cutscene){
                                                if(fade(interval, 'in', 1000)){
                                                    go = true;
                                                    section = 0;
                                                    clearInterval(creditsInterval);
                                                }
                                                interval += Canvas.IntervalTime;
                                            }
                                        }, Canvas.IntervalTime);
                                    }else{
                                        interval += Canvas.IntervalTime;
                                        if(interval <= 1000){
                                            Canvas.clear();
                                            drawCredits();
                                        }
                                        if(fade(interval, 'out', 1000)){
                                            Information.cutscene = false
                                        }
                                    }
                                }, Canvas.IntervalTime);
                            } else if(section === 2){
                                go = false;
                                let drawTutorial = function(){
                                    Context.font = '30px Arial black';
                                    Context.fillStyle = 'black';
                                    Context.textAlign = 'center';
                                    Context.fillText('Tutorial', Element('GameArea').width/2, 30);
                                    Context.font = '20px Arial black';
                                    Context.fillText('I\'m too lazy to', Element('GameArea').width/2, Element('GameArea').height/2);
                                    Context.fillText('write a tutorial', Element('GameArea').width/2, Element('GameArea').height/2 + 20);
                                    Context.font = '10px Arial black';
                                    Context.fillText('Figure it out yourself', Element('GameArea').width/2, Element('GameArea').height/2 + 35);
                                };
                                let interval = 0;
                                let fadeLoop = setInterval(function(){
                                    if(!Information.cutscene){
                                        clearInterval(fadeLoop);
                                        let tutorialInterval = setInterval(function(){
                                            if((Information.cutscene && interval <= 1000)||!Information.cutscene) {
                                                Canvas.clear();
                                                drawTutorial();
                                                Context.font = '10px Arial black';
                                                Context.fillText('Back', Element('GameArea').width / 2, Element('GameArea').height - 20);
                                                if (UserInput.mouse.click && (Math.abs(Element('GameArea').width / 2 - UserInput.mouse.X) < 30) && (Math.abs(Element('GameArea').height - 20 - UserInput.mouse.Y) < 15)) {
                                                    interval = 0;
                                                    Information.cutscene = true;
                                                }
                                            }
                                            if(Information.cutscene){
                                                if(fade(interval, 'in', 1000)){
                                                    go = true;
                                                    section = 0;
                                                    clearInterval(tutorialInterval);
                                                }
                                                interval += Canvas.IntervalTime;
                                            }
                                        }, Canvas.IntervalTime);
                                    }else{
                                        interval += Canvas.IntervalTime;
                                        if(interval <= 1000){
                                            Canvas.clear();
                                            drawTutorial();
                                        }
                                        if(fade(interval, 'out', 1000)){
                                            Information.cutscene = false;
                                        }
                                    }
                                }, Canvas.IntervalTime);
                            }
                        }
                    }, 1);
                }else if(Area === 'game'){
                    proceed = false;
                    TimeStart = Canvas.Time;
                    let IngredientsArray = [];
                    let MaxBound = 20;
                    let Menu = {
                        createOrder: function() {
                            let ingredients = ['lettuce', 'tomato', 'burger'];
                            let order = ['BottomBun'];
                            for (let i = 0; i < 4; i++) {
                                order.push(ingredients[Math.floor(Math.random() * ingredients.length)]);
                            }
                            order.push('TopBun');
                            return order;
                        },
                        displayOrder: function(x, y, scale, order){
                            Context.textAlign = 'center';
                            Context.fillStyle = 'black';
                            Context.font = '10px Arial black';
                            Context.fillText('Order:', x, y);
                            let increment = 70*scale;
                            for(let i = 0; i < order.length; i++){
                                let s = new CreateSprites(x, y + 40*scale + order.length * increment - increment*i, 0, 0, 0, 0, 0, 0, 0, order[i], 1, 10, 10, scale, 1, 1, order[i]);
                                s.width = s.originalWidth;
                                s.height = s.originalHeight;
                                s.draw();
                            }
                        },
                        displayButton: function(x, y){
                            Context.textAlign = 'center';
                            Context.fillStyle = 'black';
                            Context.font = '10px Arial black';
                            Context.fillText('Restart', x, y);
                            Context.fillText('Submit', x, y + 20);
                        },
                    }
                    let spawner = null;
                    let building = 0;
                    let order = Menu.createOrder();
                    let score = 1;
                    let go  = false;
                    Information.cutscene = false;
                    let catcher = new CreateSprites(Element('GameArea').width/2, Element('GameArea').height, 0, 0, 0, 0, 0, 0, 0, 'plate', 1 , 100, 20, 0.2, 1, 1, 'plate');
                    let GameLoop = setInterval(function(){
                        if(!go) {
                            if (building === 0) {
                                go = true;
                                catcher.width = Element('plate').naturalWidth;
                                catcher.height = Element('plate').naturalHeight;
                                catcher.Y -= catcher.height/2 * catcher.scale;
                                let CheckTopple = function(bound = 9){
                                    let topple = function(reference, direction, start){
                                        for(let i = start - start * Number(bound === 0); i< IngredientsArray.length; i++){
                                            let select = IngredientsArray[i];
                                            select.fall = true;
                                            select.VelocityX = 0.01 * Math.abs(direction)/direction * Math.sqrt((select.X - reference.X)**2+(select.Y - reference.Y)**2);
                                            select.AccelerationX = select.VelocityX * -1/500;
                                            select.AccelerationY = 0.01;
                                            select.VelocityAngle = Math.abs(direction)/direction * (Math.floor(Math.random()* 4) + 1);
                                            IngredientsArray[i] = null;
                                        }
                                        while(IngredientsArray.indexOf(null) > -1){
                                            IngredientsArray.splice(IngredientsArray.indexOf(null), 1);
                                        }
                                    };
                                    if(IngredientsArray.length > bound){
                                        topple(IngredientsArray[Math.floor(IngredientsArray.length/2)], Math.cos(Math.PI * (Math.floor(Math.random() * 2))), Math.floor(IngredientsArray.length/2));
                                    }else{
                                        for(let i = 0; i< IngredientsArray.length; i++){
                                            let average = 0;
                                            for(let j = i; j< IngredientsArray.length; j++){
                                                average += IngredientsArray[j].X;
                                            }
                                            average /= (IngredientsArray.length - i);
                                            if(i === 0 && Math.abs(catcher.X - average) > catcher.width * catcher.scale/3){
                                                topple(catcher, average - catcher.X, 0);
                                                break;
                                            }else if(i > 0 && Math.abs(IngredientsArray[i].X - average) > IngredientsArray[i].width * IngredientsArray[i].scale/3){
                                                topple(IngredientsArray[i], average - IngredientsArray[i].X, i);
                                                break;
                                            }
                                        }
                                    }
                                };
                                let Interval = 0;
                                Information.cutscene = true;
                                let repeat = setInterval(function() {
                                    if (!Information.cutscene) {
                                        clearInterval(repeat);
                                        spawner = setInterval(function(){
                                            let ingredients = ['lettuce', 'tomato', 'burger', 'TopBun', 'BottomBun'];
                                            let select = Math.floor(Math.random() * ingredients.length);
                                            let x = new CreateSprites(0, 0, 0, 0, 0, 0, 0, 0.01, 0, ingredients[select], 1, 10, 10, 0.2, 1, 1, ingredients[select]);
                                            x.width = x.originalWidth;
                                            x.height = x.originalHeight;
                                            x.stop = false;
                                            x.Y = -x.height*x.scale/2;
                                            x.HitBoxUpdate();
                                            x.X = (Element('GameArea').width/2 - x.scale*x.width) * Math.cos(Math.PI * Math.random()* 2) + Element('GameArea').width/2;
                                            x.fall = false;
                                            Canvas.objects[0].push(x);
                                        }, Canvas.IntervalTime * 100);
                                        let dropping = setInterval(function () {
                                            if (!(UserInput.keys.ArrowRight && UserInput.keys.ArrowLeft)) {
                                                if (UserInput.keys.ArrowRight && catcher.X + catcher.scale * catcher.width / 2 < Element('GameArea').width) {
                                                    catcher.VelocityX = 3;
                                                } else if (UserInput.keys.ArrowLeft && catcher.X - catcher.scale * catcher.width / 2 > 0) {
                                                    catcher.VelocityX = -3;
                                                } else if (!(catcher.scale * catcher.width / 2 < catcher.X < Element('GameArea').width - catcher.scale * catcher.width / 2)) {
                                                    catcher.VelocityX = 0;
                                                    while (!(catcher.scale * catcher.width / 2 < catcher.X < Element('GameArea').width - catcher.scale * catcher.width / 2)) {
                                                        catcher.X += (Element('GameArea').width / 2 - catcher.X) / (Math.abs(Element('GameArea').width / 2 - catcher.X)) * 0.01;
                                                    }
                                                } else {
                                                    catcher.VelocityX = 0;
                                                }
                                            } else {
                                                catcher.VelocityX = 0;
                                            }
                                            if (!(UserInput.keys.ArrowUp && UserInput.keys.ArrowDown)) {
                                                if (UserInput.keys.ArrowDown && catcher.Y + catcher.scale * catcher.height / 2 < Element('GameArea').height) {
                                                    catcher.VelocityY = 3;
                                                } else if (UserInput.keys.ArrowUp && catcher.Y > Element('GameArea').height - catcher.height * catcher.scale / 2 - MaxBound) {
                                                    catcher.VelocityY = -3;
                                                } else if (!(Element('GameArea').height - MaxBound < catcher.Y + catcher.height * catcher.scale / 2 < Element('GameArea').height)) {
                                                    catcher.VelocityY = 0;
                                                    while (!(Element('GameArea').height - MaxBound < catcher.Y + catcher.height * catcher.scale / 2 < Element('GameArea').height)) {
                                                        catcher.Y += ((2 * Element('GameArea') - catcher.height * catcher.scale - MaxBound) / 2 - catcher.Y) / (Math.abs((2 * Element('GameArea') - catcher.height * catcher.scale - MaxBound) / 2 - catcher.Y)) * 0.01;
                                                    }
                                                } else {
                                                    catcher.VelocityY = 0;
                                                }
                                            } else {
                                                catcher.VelocityY = 0;
                                            }
                                            if((Information.cutscene && Interval <= 1000) || !Information.cutscene) {
                                                for (let i = 0; i < Canvas.objects[0].length; i++) {
                                                    let select = Canvas.objects[0][i];
                                                    Canvas.objects[0][i].HitBoxUpdate();
                                                    if (!select.fall) {
                                                        if (IngredientsArray.length === 0) {
                                                            if (CheckHitBoxes(select.HitDown, [catcher])) {
                                                                select.Displacement = select.X - catcher.X;
                                                                IngredientsArray.push(select);
                                                                select.AccelerationY = 0;
                                                                select.VelocityY = 0;
                                                            }
                                                        } else {
                                                            let last = IngredientsArray[IngredientsArray.length - 1];
                                                            if (CheckHitBoxes(select.HitDown, [last])) {
                                                                select.Displacement = select.X - catcher.X;
                                                                IngredientsArray.push(select);
                                                                select.AccelerationY = 0;
                                                                select.VelocityY = 0;
                                                            }
                                                        }
                                                    }
                                                }
                                                if (!Information.cutscene && UserInput.mouse.click && (Math.abs(UserInput.mouse.X - 65) < 30) && ((Math.abs(UserInput.mouse.Y - 7) < 10))) {
                                                    CheckTopple(0);
                                                } else {
                                                    CheckTopple();
                                                }
                                                for (let i = 0; i < IngredientsArray.length; i++) {
                                                    IngredientsArray[i].Y = catcher.Y - 5 - i * 8;
                                                    IngredientsArray[i].X = catcher.X + IngredientsArray[i].Displacement;
                                                }
                                                Canvas.removeNull();
                                                Canvas.loop();
                                                catcher.updatePosition();
                                                catcher.draw();
                                                Canvas.drawAll([0,]);
                                                Menu.displayOrder(20, 10, 0.1, order);
                                                if (Information.costumerIndex >= 0) {
                                                    if (!Canvas.objects[1][Information.costumerIndex].displayTimer(200, 20, 180, 20)) {
                                                        Information.costumerIndex = -1;
                                                    }
                                                }
                                                if (IngredientsArray.length > 0) {
                                                    Menu.displayButton(65, 10);
                                                    if (!Information.cutscene && UserInput.mouse.click && (Math.abs(UserInput.mouse.X - 65) < 30) && ((Math.abs(UserInput.mouse.Y - 27) < 10))) {
                                                        score += Math.abs(IngredientsArray.length - order.length) * 10;
                                                        for(let i = 0; i< IngredientsArray.length; i++){
                                                            if(i === 0){
                                                                score += Math.abs(IngredientsArray[i].Displacement)/20;
                                                            }else{
                                                                score += Math.abs(IngredientsArray[i].Displacement - IngredientsArray[i -1].Displacement)/20;
                                                            }
                                                        }
                                                        let insideOf = function(input){
                                                            for(let i = 0; i<IngredientsArray.length; i++){
                                                                if(IngredientsArray[i].type === input){
                                                                    return i;
                                                                }
                                                            }
                                                            return -1;
                                                        }
                                                        for(let i = 0; i<order.length; i++){
                                                            if(insideOf(order[i]) >= 0){
                                                                let places = [];
                                                                for(let j = 0; j<IngredientsArray.length; j++){
                                                                    if(IngredientsArray[j].type === order[i]){
                                                                        places.push(j);
                                                                    }
                                                                }
                                                                let min = IngredientsArray.length;
                                                                for(let j = 0; j<places.length; j++){
                                                                    if(Math.abs(places[j] - insideOf(order[i])) < min){
                                                                        min = Math.abs(places[j] - insideOf(order[i]));
                                                                    }
                                                                }
                                                                score += min * 20;
                                                            }else{
                                                                score += order.length * 20;
                                                            }
                                                        }
                                                        score = Math.round(30000/(score**3) - 100);
                                                        building = 1;
                                                        go = false;
                                                        clearInterval(dropping);
                                                    }
                                                }
                                                Context.textAlign = 'center';
                                                Context.font = '10px Arial black';
                                                Context.fillStyle = 'black';
                                                Context.fillText('Quit', 65, 50);
                                                if (!Information.cutscene && UserInput.mouse.click && (Math.abs(UserInput.mouse.X - 65) < 30) && ((Math.abs(UserInput.mouse.Y - 47) < 10))) {
                                                    Interval = 0;
                                                    Information.cutscene = true;
                                                    for (let i = 0; i < Canvas.objects[1].length; i++) {
                                                        Canvas.objects[1][i].distance = GetTime() - Canvas.objects[1][i].timer;
                                                    }
                                                }
                                            }
                                            if(Information.cutscene){
                                                if(fade(Interval, 'in', 1000)) {
                                                    Area = 'lobby';
                                                    proceed = true;
                                                    while(Canvas.objects[0].length > 0){
                                                        Canvas.objects[0].splice(0, 1);
                                                    }
                                                    for (let i = 0; i < Canvas.objects[0].length; i++) {
                                                        Canvas.objects[0][i] = null;
                                                    }
                                                    Canvas.removeNull();
                                                    clearInterval(dropping);
                                                    clearInterval(spawner);
                                                    clearInterval(GameLoop);
                                                }
                                                Interval += Canvas.IntervalTime;
                                            }
                                            for (let i = 0; i < Canvas.objects.length; i++) {
                                                for (let j = 0; j < Canvas.objects[i].length; j++) {
                                                    if (Canvas.objects[i][j].Y > Element('GameArea').height + Canvas.objects[i][j].height) {
                                                        Canvas.objects[i].splice(j, 1, null);
                                                    }
                                                }
                                            }
                                            if (Information.strikes >= 3) {
                                                proceed = true;
                                                Area = 'end';
                                                clearInterval(dropping);
                                                clearInterval(GameLoop);
                                            }
                                            Canvas.removeNull();
                                        }, Canvas.IntervalTime);
                                    } else{
                                        Interval += Canvas.IntervalTime;
                                        Canvas.clear();
                                        if(Interval <= 2000){
                                            Menu.displayOrder(20, 10, 0.1, order);
                                            catcher.draw();
                                            Canvas.objects[1][Information.costumerIndex].displayTimer(200, 20, 180, 20);
                                        }
                                        if(fade(Interval, 'same', 1000)){
                                            if(fade(Interval - 1000, 'out', 1000)) {
                                                Information.cutscene = false;
                                            }
                                        }
                                    }
                                }, Canvas.IntervalTime);
                            } else if (building === 1) {
                                go = true;
                                Information.cutscene = true;
                                if(!(Information.costumerIndex === -1) && (score > 0)) {
                                    Canvas.objects[1][Information.costumerIndex].mad = 1;
                                }else{
                                    Information.strikes += 1;
                                }
                                let IntervalLoop= 0;
                                let fading= setInterval(function(){
                                    IntervalLoop += Canvas.IntervalTime;
                                    if(IntervalLoop <= 2000) {
                                        Canvas.loop();
                                        catcher.draw();
                                        Canvas.drawAll([0,]);
                                        if (IntervalLoop > 1600) {
                                            clearInterval(spawner);
                                            for (let i = 0; i < Canvas.objects[0].length; i++) {
                                                Canvas.objects[0][i] = null;
                                            }
                                            Canvas.removeNull();
                                        }
                                    }
                                    if(fade(IntervalLoop, 'in', 1000)){
                                        if(fade(IntervalLoop - 1000, 'same', 1000)){
                                            go = false;
                                            building = 2;
                                            clearInterval(fading);
                                        }
                                    }
                                }, Canvas.IntervalTime);
                            } else if(building === 2) {
                                go = true;
                                if(score < 0){score = 0;}
                                let IntervalCount = 0;
                                let stuff = function(score){
                                    Context.drawImage(Element('Counter'), 0, 100, Element('GameArea').width, 50);
                                    catcher.X = Element('GameArea').width * 0.25;
                                    catcher.Y = 100;
                                    catcher.draw();
                                    for (let i = 0; i < IngredientsArray.length; i++) {
                                        IngredientsArray[i].Y = catcher.Y - 5 - i * 8;
                                        IngredientsArray[i].X = catcher.X + IngredientsArray[i].Displacement;
                                        IngredientsArray[i].draw();
                                    }
                                    Context.textAlign = 'center';
                                    Context.fillStyle = 'black';
                                    Context.font = '30px Arial black';
                                    Context.fillText('SCORE', Element('GameArea').width / 4 * 3, Element('GameArea').height / 2 - 40);
                                    Context.font = '10px Arial black';
                                    Context.fillText('Quality: ' + score, Element('GameArea').width / 4 * 3, Element('GameArea').height / 2 - 20);
                                }
                                let fades = setInterval(function(){
                                    if(Information.cutscene){
                                        IntervalCount += Canvas.IntervalTime;
                                        if(IntervalCount <= 1000){
                                            Canvas.clear();
                                            stuff(score);
                                        }
                                        if(fade(IntervalCount, 'out', 1000)){
                                            Information.cutscene = false;
                                        }
                                    }else{
                                        clearInterval(fades);
                                        let IntervalCount = 0;
                                        let results = setInterval(function(){
                                            IntervalCount += Canvas.IntervalTime;
                                            if((Information.cutscene && IntervalCount<= 1000)|| !Information.cutscene) {
                                                for (let i = 0; i < Canvas.objects[1].length; i++) {
                                                    Canvas.objects[1][i].timer += Canvas.IntervalTime;
                                                }
                                                Canvas.clear();
                                                stuff(score);
                                                if (Information.costumerIndex === -1) {
                                                    Context.fillText('They Left...', Element('GameArea').width / 4 * 3, Element('GameArea').height / 2 - 5);
                                                }
                                                if (Information.costumerIndex === -1 && score > 0) {
                                                    score -= 1;
                                                } else {
                                                    Context.fillText('Continue', Element('GameArea').width / 4 * 3, Element('GameArea').height / 2 + 10);
                                                    if (!Information.cutscene && UserInput.mouse.click && (Math.abs(UserInput.mouse.X - Element('GameArea').width / 4 * 3) < 30) && ((Math.abs(UserInput.mouse.Y - (Element('GameArea').height / 2 + 10)) < 15))) {
                                                        Information.cutscene = true;
                                                        for (let i = 0; i < Canvas.objects[1].length; i++) {
                                                            Canvas.objects[1][i].distance = GetTime() - Canvas.objects[1][i].timer;
                                                        }
                                                        IntervalCount = 0;
                                                    }
                                                }
                                            }
                                            if(Information.cutscene) {
                                                if (fade(IntervalCount, 'in', 1000)) {
                                                    Information.ratings += score;
                                                    if (score < 0 && !(Information.costumerIndex === -1)) {
                                                        Canvas.objects[1][Information.costumerIndex].mad = 2;
                                                    }
                                                    Information.cutscene = false;
                                                    proceed = true;
                                                    Area = 'lobby';
                                                    clearInterval(GameLoop);
                                                    clearInterval(results);
                                                }
                                            }
                                        }, Canvas.IntervalTime);
                                    }
                                }, Canvas.IntervalTime);
                            }
                        }
                    }, 10);
                }else if(Area === 'lobby'){
                    proceed = false;
                    let go = true;
                    let spot = 0;
                    let lobbyLoop = setInterval(function(){
                        if(go){
                            if(spot === 0){
                                go = false;
                                Canvas.Time = GetTime();
                                let walk = [];
                                let createCostumer = function(x, y, angle, scale, img) {
                                    let costumer = new CreateSprites(x, y, angle, 0, 0, 0, 0, 0, 0, img, 1, 0, 0, scale, 1, 1, 'costumer');
                                    costumer.width = Element('c1').naturalWidth;
                                    costumer.height = Element('c1').naturalHeight;
                                    costumer.timer = GetTime();
                                    costumer.tolerance = 60000;
                                    costumer.mad = 0; //0 is neutral, 1 is leaving happy, 2 is leaving unhappy
                                    costumer.despawn = false;
                                    costumer.distance = 0;
                                    costumer.displayTimer = function (x, y, width, height) {
                                        if (costumer.timer + costumer.tolerance - GetTime() >= 0) {
                                            Context.fillStyle = 'black';
                                            Context.fillRect(x - width / 2, y - height / 2, width, height);
                                            let txt = '';
                                            let values = ['a', 'b', 'c', 'd', 'e', 'f'];
                                            let amount;
                                            let up = (GetTime() - costumer.timer > costumer.tolerance/2);
                                            if(GetTime() - costumer.timer > costumer.tolerance/2) {
                                                amount = Math.round(255 - 255*(GetTime() - (costumer.timer + costumer.tolerance/2)) / (costumer.tolerance/2));
                                            }else{
                                                amount = Math.round(255* (GetTime() - costumer.timer)/(costumer.tolerance/2));
                                            }
                                            let stuff = [Math.floor(amount / 16), Math.floor(amount % 16)];
                                            for (let i = 0; i < stuff.length; i++) {
                                                if (stuff[i] >= 10) {
                                                    stuff.splice(i, 1, values[stuff[i] - 10]);
                                                }
                                                txt += stuff[i];
                                            }
                                            if(up){
                                                txt = '#ff' + txt + '00';
                                                Context.fillStyle = txt;
                                                Context.fillRect(x - width / 2 + 1, y - height / 2 + 1, (width - 2)*0.5 - (width - 2) * 0.5 *(1 - (amount / 255)), height - 2);
                                            }else{
                                                txt = '#' + txt + 'ff00';
                                                Context.fillStyle = txt;
                                                Context.fillRect(x - width / 2 + 1, y - height / 2 + 1, (width - 2) - (width - 2) * ((amount / 255)/2), height - 2);
                                            }
                                            Context.fillStyle = 'black';
                                            return true;
                                        } else {
                                            Context.fillStyle = 'black';
                                            if((1 - (GetTime() - (this.timer + this.tolerance)) * 0.005) >= 0){
                                                Context.globalAlpha = (1 - (GetTime() - (this.timer + this.tolerance)) * 0.005);
                                                Context.fillRect(x - width / 2, y - height / 2, width, height);
                                            }
                                            Context.globalAlpha = 1;
                                            return false;
                                        }
                                    };
                                    costumer.hover = function () {
                                        if((((GetTime() - (this.timer + this.tolerance))) > 0)&&costumer.mad === 0){
                                            costumer.mad = 2;
                                            Information.strikes += 1;
                                        }
                                        if ((Math.abs(UserInput.mouse.X - costumer.X) < costumer.width*costumer.scale / 2) && (Math.abs(UserInput.mouse.Y - costumer.Y) < costumer.height*costumer.scale / 2)) {
                                            if(!(costumer.mad === 1)) {
                                                costumer.displayTimer(costumer.X, costumer.Y - costumer.height * costumer.scale / 2 - 20, 50, 25);
                                                Context.fillStyle = 'green';
                                                if ((1 - (GetTime() - (costumer.timer + costumer.tolerance)) * 0.005) > 0) {
                                                    Context.globalAlpha = (1 - (GetTime() - (costumer.timer + costumer.tolerance)) * 0.005);
                                                    Context.fillRect(costumer.X - 20, costumer.Y + 10, 40, 15);
                                                    Context.font = '10px Arial black';
                                                    Context.fillStyle = 'white';
                                                    Context.textAlign = 'center';
                                                    Context.fillText('Serve', costumer.X, costumer.Y + 20);
                                                    if (costumer.mad === 0 && UserInput.mouse.click && (Math.abs(UserInput.mouse.X - costumer.X) < 20) && (Math.abs(UserInput.mouse.Y - costumer.Y) < 20)) {
                                                        return true;
                                                    }
                                                }
                                                Context.globalAlpha = 1;
                                            }
                                        }
                                        if(!(costumer.mad === 0)) {
                                            if(costumer.X < Element('GameArea').width + costumer.width * costumer.scale){
                                                costumer.X += 1;
                                            }else{
                                                costumer.despawn = true;
                                            }
                                            if(costumer.Y - costumer.height * costumer.scale/2 -50 > 0){
                                                costumer.Y -= 1;
                                            }
                                        }else{
                                            if((costumer.X > 100 + Canvas.objects[1].indexOf(costumer) * 50) && costumer.mad === 0){
                                                costumer.X -= 2;
                                                costumer.angle = 5 * Math.cos((Math.PI * (GetTime()-Canvas.Time)/Canvas.IntervalTime)%2);
                                            }else if(costumer.mad === 0){
                                                costumer.angle = 0;
                                            }
                                        }
                                        return false;
                                    };
                                    Canvas.objects[1].push(costumer);
                                };
                                createCostumer(Element('GameArea').width + 200, 100, 0, 0.2, 'c1');
                                let interval = 0;
                                if(SpawnCostumers === null){
                                    let RepeatTime = 1;
                                    SpawnCostumers = setInterval(function(){
                                        if((Math.round(GetTime()/RepeatTime)*RepeatTime) % (10000) === 0 && (!Information.cutscene)){
                                            createCostumer(Element('GameArea').width + 200, 100, 0, 0.2, 'c1');
                                        }
                                    }, RepeatTime);
                                }
                                Information.cutscene = true;
                                let fade_loop = setInterval(function(){
                                    if(!Information.cutscene) {
                                        clearInterval(fade_loop);
                                        interval = 0;
                                        let costumerArea = setInterval(function () {
                                            interval += Canvas.IntervalTime;
                                            if((Information.cutscene && interval <= 1000) || !Information.cutscene) {
                                                Canvas.clear();
                                                Context.drawImage(Element('Lobby'), 0, 0, Element('GameArea').width, Element('GameArea').height);
                                                Context.font = '10px Arial black';
                                                Context.textAlign = 'center';
                                                Context.fillStyle = 'black';
                                                Context.fillText('STRIKES: ' + Information.strikes, 50, 20);
                                                for (let i = 0; i < walk.length; i++) {
                                                    walk[i].hover();
                                                    walk[i].draw();
                                                    if (walk[i].despawn) {
                                                        walk[i] = null;
                                                    }
                                                }
                                                Context.drawImage(Element('Rope'), 120, 75, 150, 50);
                                                for (let i = 0; i < Canvas.objects[1].length; i++) {
                                                    Canvas.objects[1][i].draw();
                                                    if (!Information.cutscene) {
                                                        if (Canvas.objects[1][i].hover()) {
                                                            Information.cutscene = true;
                                                            interval = 0;
                                                            Information.costumerIndex = i;
                                                            for(let i = 0; i<Canvas.objects[1].length; i++){
                                                                Canvas.objects[1][i].distance = GetTime() - Canvas.objects[1][i].timer;
                                                            }
                                                        }
                                                    }
                                                    if (!(Canvas.objects[1][i].mad === 0)) {
                                                        walk.push(Canvas.objects[1][i]);
                                                        Canvas.objects[1][i] = null;
                                                    }
                                                }
                                            }
                                            if (Information.cutscene) {
                                                if (fade(interval, 'in', 1000)) {
                                                    Area = 'game';
                                                    proceed = true;
                                                    clearInterval(costumerArea);
                                                    clearInterval(lobbyLoop);
                                                }
                                            }
                                            while (walk.indexOf(null) >= 0) {
                                                walk.splice(walk.indexOf(null), 1);
                                            }
                                            if (Information.strikes >= 3) {
                                                proceed = true;
                                                Area = 'end';
                                                clearInterval(costumerArea);
                                                clearInterval(lobbyLoop);
                                                clearInterval(SpawnCostumers)
                                                SpawnCostumers = walk;
                                            }
                                            Canvas.removeNull();
                                        }, Canvas.IntervalTime);
                                    }else{
                                        interval += Canvas.IntervalTime;
                                        Canvas.clear();
                                        Context.drawImage(Element('Lobby'), 0, 0, Element('GameArea').width, Element('GameArea').height);
                                        Context.drawImage(Element('Rope'), 120, 75, 150, 50);
                                        for(let i = 0; i<Canvas.objects[1].length; i++){
                                            Canvas.objects[1][i].draw();
                                        }
                                        if(fade(interval, 'same', 1000)) {
                                            if (fade(interval - 1000, 'out', 1000)) {
                                                Information.cutscene = false;
                                            }
                                        }
                                    }
                                }, Canvas.IntervalTime);
                            }
                        }
                    }, 1);
                }else if(Area === 'end'){
                    proceed = false;
                    let interval = 0;
                    Information.cutscene = true;
                    let DrawResults = function(){
                        Context.font = '30px Arial black';
                        Context.textAlign = 'center';
                        Context.fillStyle = 'black';
                        Context.fillText('Game Over', Element('GameArea').width / 2, Element("GameArea").height / 2);
                        Context.font = '10px Arial black';
                        Context.fillText('Score: ' + Information.ratings, Element('GameArea').width / 2, Element('GameArea').height / 2 + 30);
                    }
                    let fadeLoop = setInterval(function(){
                        if(!Information.cutscene) {
                            clearInterval(fadeLoop);
                            interval = 0;
                            let endLoop = setInterval(function () {
                                interval += Canvas.IntervalTime;
                                if((Information.cutscene && interval<= 1000) || !Information.cutscene) {
                                    Canvas.clear();
                                    DrawResults();
                                    Context.fillText('Back to Main Menu', Element('GameArea').width / 2, Element("GameArea").height - 20);
                                    if (!Information.cutscene && UserInput.mouse.click && (Math.abs(Element('GameArea').width / 2 - UserInput.mouse.X) < 30) && (Math.abs(Element("GameArea").height - 20 - UserInput.mouse.Y) < 10)) {
                                        Information.cutscene = true;
                                        interval = 0;
                                    }
                                }
                                if (Information.cutscene) {
                                    if (fade(interval, 'in', 1000)) {
                                        Area = 'title';
                                        Information.money = 0
                                        Information.ratings = 0;
                                        Information.costumerIndex = -1;
                                        Information.strikes = 0;
                                        for (let i = 0; i < Canvas.objects.length; i++) {
                                            while (Canvas.objects[i].length > 0) {
                                                Canvas.objects[i].splice(0, 1);
                                            }
                                        }
                                        proceed = true;
                                        clearInterval(endLoop)
                                    }
                                }
                            }, Canvas.IntervalTime);
                        }else{
                            interval += Canvas.IntervalTime;
                            Canvas.clear();
                            if(interval <= 1000){
                                Context.drawImage(Element('Lobby'), 0, 0, Element('GameArea').width, Element('GameArea').height);
                                for(let i = 0; i<SpawnCostumers.length; i++){
                                    SpawnCostumers[i].draw();
                                }
                                Context.drawImage(Element('Rope'), 120, 75, 150, 50);
                                Canvas.drawAll([1]);
                            }
                            if(fade(interval, 'in', 1000)){
                                DrawResults();
                                SpawnCostumers = null;
                                if(fade(interval - 1000, 'out', 1000)){
                                    Information.cutscene = false;
                                }
                            }
                        }
                    }, Canvas.IntervalTime);
                }
            }
        }, 1);
    },
    loop: function(){
        Canvas.clear();
        UserInput.keys.update();
        this.Time += Canvas.IntervalTime;
    },
    initialize: function(){
        Context = Element('GameArea').getContext('2d');
        UserInput.initialize();
        for (let i = 0; i < 2; i++){
            this.objects.push([]);
        }
        this.interval();
        setInterval(function(){
            if(Information.cutscene){
                for(let i = 0; i<Canvas.objects[1].length; i++){
                    Canvas.objects[1][i].timer += Canvas.IntervalTime;
                }
            }
        }, Canvas.IntervalTime);
    },
    clear: function(){Context.clearRect(0, 0, Element('GameArea').width, Element('GameArea').height);},
    drawAll: function(lists = 'all'){
        Canvas.removeNull();
        let apply = function(select){
            let reducing = ['X', 'Y', 'angle', 'VelocityX', 'VelocityY', 'VelocityAngle', 'AccelerationX', 'AccelerationY', 'AccelerationAngle', 'width', 'height'];
            for(let k = 0; k< reducing.length; k++){
                select[reducing[k]] = Math.round(select[reducing[k]] * 100)/100;
            }
            select.updatePosition();
            select.HitBoxUpdate();
            select.draw();
            return select;
        }
        if(lists === 'all'){
            for (let i = 0; i < Canvas.objects.length; i++) {
                for (let j = 0; j < Canvas.objects[i].length; j++) {
                    Canvas.objects[i][j] = apply(Canvas.objects[i][j]);
                }
            }
        }else{
            for(let i = 0; i<lists.length; i++){
                for(let j = 0; j<Canvas.objects[lists[i]].length; j++){
                    Canvas.objects[lists[i]][j] = apply(Canvas.objects[lists[i]][j]);
                }
            }
        }
    },
    removeNull: function(){
        for (let i = 0; i < Canvas.objects.length; i++) {
            while (Canvas.objects[i].indexOf(null) > -1) {
                Canvas.objects[i].splice(Canvas.objects[i].indexOf(null), 1);
            }
        }
    },
}

function CheckHitBoxes(HitBoxGroup, Targets, OverRide = false){
    if(!OverRide){
        for (let i = 0; i < Targets.length; i++) {
            let Sprite = Targets[i];
            for (let j = 0; j < HitBoxGroup.length; j++) {
                let X = ExtractCoordinates(HitBoxGroup[j], 'x');
                let Y = ExtractCoordinates(HitBoxGroup[j], 'y');
                if((Math.abs(X - Sprite.X) < Sprite.scale * Sprite.width/2) && ((Math.abs(Y - Sprite.Y)) < Sprite.scale * Sprite.height/2)){
                    return true
                }
            }
        }
    }
    return false;
}

function fade(time, direction, length){
    let DrawFade = function(value){
        Context.globalAlpha = value;
        Context.fillStyle = '#000000';
        Context.fillRect(0, 0, Element('GameArea').width, Element('GameArea').height);
        Context.globalAlpha = 1;
    };
    if(time > length){
        return true;
    }else{
        if(direction === 'in'){
            DrawFade(time/length);
        }else if(direction === 'same'){
            DrawFade(1);
        }else if(direction === 'out'){
            DrawFade(1 - (time)/length);
        }
        return false;
    }
}