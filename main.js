//Глобальные переменные
var FIELD_SIZE_X = 16;
var FIELD_SIZE_Y = 16;
var snake = []; //Сама змейка
var direction = 'y+'; //Направление движения змейки
var oldDirection = 'y+'; //Старое направление движения змейки
var gameIsRunning = false; //Запущена ли игра
var snakeTimer; //Таймер змейки
var score = 0; //Результат
var oldScore = 0;
var pause = false;
var startx = 0;
var starty = 0;
var dist = 0;
var nextLevel = 5;
var snakeSpeed = 300;


function starOneEasy() {
	document.querySelectorAll('.star')[2].classList.remove('star-fill');
	document.querySelectorAll('.star')[1].classList.remove('star-fill');
	document.querySelectorAll('.star')[2].classList.add('star-free');
	document.querySelectorAll('.star')[1].classList.add('star-free');
	snakeSpeed = 450;
}
function starTwoMedium() {
	document.querySelectorAll('.star')[2].classList.remove('star-fill');
	document.querySelectorAll('.star')[1].classList.remove('star-free');
	document.querySelectorAll('.star')[1].classList.add('star-fill');
	document.querySelectorAll('.star')[2].classList.add('star-free');
	snakeSpeed = 300;
}
function starThreeHard() {
	document.querySelectorAll('.star')[2].classList.remove('star-free');
	document.querySelectorAll('.star')[1].classList.remove('star-free');
	document.querySelectorAll('.star')[2].classList.add('star-fill');
	document.querySelectorAll('.star')[1].classList.add('star-fill');
	snakeSpeed = 200;
}

//Генерация поля
prepareGameField();

// var wrap = document.getElementsByClassName('wrap')[0];
// //Подгоняем размер контейнера под игровое поле
// if(16 * (FIELD_SIZE_X + 1) < 200){
//     wrap.style.width = '200px';
// } else {
//     wrap.style.width = (16 * (FIELD_SIZE_X + 1)).toString() + 'px';
// 	wrap.style.height = (16 * (FIELD_SIZE_X + 1)).toString() + 'px';
// }

//Если нажата кнопка новая игра
document.getElementById('snake-new-game').addEventListener('click', startGame);
document.getElementById('snake-new-game').addEventListener('touchstart', startGame);
var wrap = document.getElementById('swipe');
wrap.addEventListener('touchstart', touchMove());
addEventListener('keydown', changeDirection);
document.querySelectorAll('.star')[0].addEventListener('click', starOneEasy);
document.querySelectorAll('.star')[1].addEventListener('click', starTwoMedium);
document.querySelectorAll('.star')[2].addEventListener('click', starThreeHard);
document.querySelectorAll('.star')[0].addEventListener('touchstart', starOneEasy);
document.querySelectorAll('.star')[1].addEventListener('touchstart', starTwoMedium);
document.querySelectorAll('.star')[2].addEventListener('touchstart', starThreeHard);
document.getElementById('pause-for-mobile').addEventListener('touchstart', pauseForMobile);
document.getElementById('pause-for-mobile').addEventListener('click', pauseForMobile);

function prepareGameField() {
    //Создаем таблицу
    var gameTable = document.createElement('table');
    gameTable.classList.add('game-table');
    //Генерация ячеек для игровой таблицы
    for (var i = 0; i < FIELD_SIZE_Y; i++){
        var row = document.createElement('tr');
        row.classList.add('game-table-row');

        for (var j = 0; j < FIELD_SIZE_X; j++)
        {
            var cell = document.createElement('td');
            cell.classList.add('game-table-cell');
            cell.classList.add('cell-' + i + '-' + j);
            row.appendChild(cell);

            if (i%2 == 0 && j%2 == 0) { cell.classList.add('game-table-cell-color-1'); }
					  if (i%2 == 1 && j%2 == 1) { cell.classList.add('game-table-cell-color-1'); }
					  if (i%2 == 0 && j%2 == 1) { cell.classList.add('game-table-cell-color-2'); }
					  if (i%2 == 1 && j%2 == 0) { cell.classList.add('game-table-cell-color-2'); }
        }
        gameTable.appendChild(row);
    }
    document.getElementById('snake-field').appendChild(gameTable);
}

//Старт игры
function startGame() {
	document.getElementById('snake-new-game').style.visibility = 'hidden';
	document.querySelector('.difficulty').style.visibility = 'hidden';
	document.getElementsByTagName('fieldset')[0].style.visibility = 'hidden';
	document.querySelector('.your-score').innerHTML = '';
	document.querySelector('.main-menu').style.width = 0;
	document.querySelector('.main-menu').style.height = 0;
	document.getElementById('pause-for-mobile').style.visibility = 'visible';
    gameIsRunning = true;
    //Сброс предыдущей игры
	  document.getElementById('score').innerHTML = '&nbsp;0';
    direction = 'y+';
    oldDirection = 'y+';
    score = 0;
	  nextLevel = 5;
    document.querySelector('.next-level-score').innerHTML = nextLevel;

    for (var i = 0; i < snake.length; i++) {
			snake[i].classList.remove('snake-head');
			snake[i].classList.remove('snake-body');
			snake[i].classList.remove('snake-turn');
			snake[i].classList.remove('snake-tale');
			snake[i].style.transform = '';
    }
    snake = [];
    var units = document.getElementsByClassName('food-unit');
    for (i = 0; i < units.length; i++) {
        units[i].classList.remove('food-unit');
    }
    var walls = document.getElementsByClassName('wall-unit');
    for (i = 0; i < walls.length; i++) {
			walls[i].classList.remove('wall-unit');
		}

    //Начало новой игры
    clearInterval(snakeTimer);
    respawn();
    snakeTimer = setInterval(move, snakeSpeed);
	setTimeout(createFood, 2000);
	setTimeout(createFood, 5000);
}

//Метод отвечает за расположение змейки в игровом поле
function respawn() {
    var startCoordsX = Math.floor(FIELD_SIZE_X / 2);
    var startCoordsY = Math.floor(FIELD_SIZE_Y / 2);
    //Голова змейки
    var snakeHead = document.getElementsByClassName('cell-' + startCoordsY + '-' + startCoordsX)[0];
	  snakeHead.classList.add('snake-head');
	snakeHead.style.transform = 'scale(1.6)';
    snakeHead.setAttribute('data_y', startCoordsY.toString());
    snakeHead.setAttribute('data_x', startCoordsX.toString());
    //Тело змейки
    var snakeBody = document.getElementsByClassName('cell-' + (startCoordsY + 1) + '-' + startCoordsX)[0];

	  var snakeTale = document.getElementsByClassName('cell-' + (startCoordsY + 2) + '-' + startCoordsX)[0];
	  snakeBody.classList.add('snake-body');
	snakeBody.classList.add('up');
	  snakeTale.classList.add('snake-tale');
    // snakeBody.classList.add('snake-unit');
    snake.unshift(snakeBody);
	  snake.unshift(snakeTale);
    snake.push(snakeHead);
}

//Движение змейки
function move() {
    var newUnit; //Новый элемент
	  var oldUnit; //Старый элемент(голова)
    var coordY = parseInt(snake[snake.length - 1].getAttribute('data_y'));
    var coordX = parseInt(snake[snake.length - 1].getAttribute('data_x'));

	oldUnit = document.querySelector('.cell-' + (coordY) + '-' + (coordX));

    //Определяем новую точку
    switch (direction)
    {
        case 'x-':
        	if (coordX > 0) {
						newUnit = document.querySelector('.cell-' + (coordY) + '-' + (coordX -= 1)); }
					else { newUnit = document.querySelector('.cell-' + (coordY) + '-' + (coordX = 15)); }
            if (snake.indexOf(newUnit) === -1 && newUnit !== null) {
        	}
            break;
        case 'x+':
        	if (coordX < 15) {
            newUnit = document.querySelector('.cell-' + (coordY) + '-' + (coordX += 1)); }
            else {newUnit = document.querySelector('.cell-' + (coordY) + '-' + (coordX = 0));}
					if (snake.indexOf(newUnit) === -1 && newUnit !== null) {
        	}
            break;
        case 'y-':
        	if (coordY < 15) {
            newUnit = document.querySelector('.cell-' + (coordY += 1) + '-' + (coordX)); }
            else { newUnit = document.querySelector('.cell-' + (coordY = 0) + '-' + (coordX)); }
					if (snake.indexOf(newUnit) === -1 && newUnit !== null) {
        	}
            break;
        case 'y+':
        	if (coordY > 0) {
            newUnit = document.querySelector('.cell-' + (coordY -= 1) + '-' + (coordX)); }
            else {  newUnit = document.querySelector('.cell-' + (coordY = 15) + '-' + (coordX)); }
					if (snake.indexOf(newUnit) === -1 && newUnit !== null) {
        	}
            break;
    }

    //Проверка. Не является ли новая часть частью змейки и не выходит ли за границы
			if(snake.indexOf(newUnit) === -1 && newUnit !== null  && !newUnit.classList.contains('wall-unit')) {
        snake[snake.length - 1].removeAttribute('data_y');
        snake[snake.length - 1].removeAttribute('data_x');

        // newUnit.classList.add('snake-unit');

				//Вставка головы змейки в следующую клетку (в т.ч. поворота)
				//вправо-вверх
				if ( (direction !== oldDirection) && (oldDirection === 'x+') && (direction === 'y+') ) {
					newUnit.classList.add('snake-head');
					newUnit.style.transform = 'scale(1.6)';
					oldUnit.classList.remove('snake-head');
					oldUnit.classList.add('snake-turn');
					oldUnit.style.transform = 'rotate(180deg)';
					snake[snake.length - 1].classList.add('up');
				}
				//вправо-вниз
				if ( (direction !== oldDirection) && (oldDirection === 'x+') && (direction === 'y-') ) {
					newUnit.classList.add('snake-head');
					newUnit.style.transform = 'scale(1.6) rotate(180deg)';
					oldUnit.classList.remove('snake-head');
					oldUnit.classList.add('snake-turn');
					oldUnit.style.transform = 'rotate(90deg)';
					snake[snake.length - 1].classList.add('down');
				}
				//влево-вверх
				if ( (direction !== oldDirection) && (oldDirection === 'x-') && (direction === 'y+') ) {
					newUnit.classList.add('snake-head');
					newUnit.style.transform = 'scale(1.6)';
					oldUnit.classList.remove('snake-head');
					oldUnit.classList.add('snake-turn');
					oldUnit.style.transform = 'rotate(270deg)';
					snake[snake.length - 1].classList.add('up');
				}
				//влево-вниз
				if ( (direction !== oldDirection) && (oldDirection === 'x-') && (direction === 'y-') ) {
					newUnit.classList.add('snake-head');
					newUnit.style.transform = 'scale(1.6) rotate(180deg)';
					oldUnit.classList.remove('snake-head');
					oldUnit.classList.add('snake-turn');
					oldUnit.style.transform = '';
					snake[snake.length - 1].classList.add('down');
				}
				//вверх-вправо
				if ( (direction !== oldDirection) && (oldDirection === 'y+') && (direction === 'x+') ) {
					newUnit.classList.add('snake-head');
					newUnit.style.transform = 'scale(1.6) rotate(90deg)';
					oldUnit.classList.remove('snake-head');
					oldUnit.classList.add('snake-turn');
					oldUnit.style.transform = '';
					snake[snake.length - 1].classList.add('right');
				}
				//вверх-влево
				if ( (direction !== oldDirection) && (oldDirection === 'y+') && (direction === 'x-') ) {
					newUnit.classList.add('snake-head');
					newUnit.style.transform = 'scale(1.6) rotate(270deg)';
					oldUnit.classList.remove('snake-head');
					oldUnit.classList.add('snake-turn');
					oldUnit.style.transform = 'rotate(90deg)';
					snake[snake.length - 1].classList.add('left');
				}
				//вниз-вправо
				if ( (direction !== oldDirection) && (oldDirection === 'y-') && (direction === 'x+') ) {
					newUnit.classList.add('snake-head');
					newUnit.style.transform = 'scale(1.6) rotate(90deg)';
					oldUnit.classList.remove('snake-head');
					oldUnit.classList.add('snake-turn');
					oldUnit.style.transform = 'rotate(270deg)';
					snake[snake.length - 1].classList.add('right');
				}
				//вниз-влево
				if ( (direction !== oldDirection) && (oldDirection === 'y-') && (direction === 'x-') ) {
					newUnit.classList.add('snake-head');
					newUnit.style.transform = 'scale(1.6) rotate(270deg)';
					oldUnit.classList.remove('snake-head');
					oldUnit.classList.add('snake-turn');
					oldUnit.style.transform = 'rotate(180deg)';
					snake[snake.length - 1].classList.add('left');
				}
				//движение вверх
				if ( (direction === oldDirection) && (direction === 'y+') ) {
					newUnit.classList.add('snake-head');
					newUnit.style.transform = 'scale(1.6)';
					oldUnit.classList.remove('snake-head');
					oldUnit.classList.add('snake-body');
					oldUnit.style.transform = '';
					snake[snake.length - 1].classList.add('up');
				}
				//движение вправо
				if ( (direction === oldDirection) && (direction === 'x+') ) {
					newUnit.classList.add('snake-head');
					newUnit.style.transform = 'scale(1.6) rotate(90deg)';
					oldUnit.classList.remove('snake-head');
					oldUnit.classList.add('snake-body');
					oldUnit.style.transform = 'rotate(90deg)';
					snake[snake.length - 1].classList.add('right');
				}
				//движение влево
				if ( (direction === oldDirection) && (direction === 'x-') ) {
					newUnit.classList.add('snake-head');
					newUnit.style.transform = 'scale(1.6) rotate(270deg)';
					oldUnit.classList.remove('snake-head');
					oldUnit.classList.add('snake-body');
					oldUnit.style.transform = 'rotate(90deg)';
					snake[snake.length - 1].classList.add('left');
				}
				//движение вниз
				if ( (direction === oldDirection) && (direction === 'y-') ) {
					newUnit.classList.add('snake-head');
					newUnit.style.transform = 'scale(1.6) rotate(180deg)';
					oldUnit.classList.remove('snake-head');
					oldUnit.classList.add('snake-body');
					oldUnit.style.transform = '';
					snake[snake.length - 1].classList.add('down');
				}

        snake.push(newUnit);
        snake[snake.length - 1].setAttribute('data_y', coordY.toString());
        snake[snake.length - 1].setAttribute('data_x', coordX.toString());

        //Хвост. Проверка
        if (!haveFood(newUnit)) {
            //Уменьшаем хвост и передвигает хвост на следующий юнит
					   removeSnakeClasses();
					   if (snake[0].classList.contains('up')) {
							 snake[0].classList.add('snake-tale');
							 snake[0].classList.remove('up');
							 snake[0].style.transform = '';
						 }
					if (snake[0].classList.contains('right')) {
						snake[0].classList.add('snake-tale');
						snake[0].classList.remove('right');
						snake[0].style.transform = 'rotate(90deg)';
					}
					if (snake[0].classList.contains('left')) {
						snake[0].classList.add('snake-tale');
						snake[0].classList.remove('left');
						snake[0].style.transform = 'rotate(270deg)';
					}
					if (snake[0].classList.contains('down')) {
						snake[0].classList.add('snake-tale');
						snake[0].classList.remove('down');
						snake[0].style.transform = 'rotate(180deg)';
					}

        }
    } else {
        //Заканчиваем игру
        finishGame();
    }
    oldDirection = direction;
}

//Создание еды
function createFood() {
    var foodCreated = false;
    // for (var i = 0; i < 2; i++)
	    while (!foodCreated) {
			var foodX = Math.floor(Math.random() * FIELD_SIZE_X);
			var foodY = Math.floor(Math.random() * FIELD_SIZE_Y);

			//Проверка на змейку
			var foodCell = document.querySelector('.cell-' + foodY + '-' + foodX);
			if (!foodCell.classList.contains('snake-unit') && !foodCell.classList.contains('food-unit')) {
				foodCell.classList.add('food-unit');
				foodCreated = true;
			}
		}
}

//Создание барьеров(wall)
function createWallLevel2() {
	var wallCreated = false;
	while (!wallCreated)
	{
		var wallX = Math.floor(Math.random() * FIELD_SIZE_X);
		var wallY = Math.floor(Math.random() * FIELD_SIZE_Y);

		//Проверка на змейку и еду
		var wallCell = document.querySelector('.cell-' + wallY + '-' + wallX);
		if(!wallCell.classList.contains('snake-unit') && !wallCell.classList.contains('food-unit') && !wallCell.classList.contains('wall-unit')) {
			// if(!wallCell.classList.contains('snake-unit') && !wallCell.classList.contains('food-unit')) {
			wallCell.classList.add('wall-unit');
			wallCreated = true;
		}
	}
}

//Проверка на еду
function haveFood(unit) {
    if(unit.classList.contains('food-unit')){
        unit.classList.remove('food-unit');
        createFood();
        score++;
			  nextLevel--;
			  document.querySelector('.next-level-score').innerHTML = nextLevel;
        //Уровни сложности
			  //Уровень 2 (5 очков). Далее 3 бомбы, 3 яблока. Каждые 5 очков пересоздается бомба
			  if (score == 5) {
					nextLevel = 25 - score;
			  	document.querySelector('.next-level-score').innerHTML = nextLevel;
					document.querySelector('.level').innerHTML = 'Уровень 2';
			  	createFood();
					createWallLevel2();
					setTimeout(createWallLevel2, 5000);
					setTimeout(createWallLevel2, 10000);
				}
			  if (score <= 25 && score%5 == 0) reCreateWall();

			  //Уровень 3 (30 очков). Далее 5 бомб, 3 яблока. Каждые 5 очков пересоздаётся бомба
			  if (score == 25) {
			  	nextLevel = 75 - score;
					document.querySelector('.next-level-score').innerHTML = nextLevel;
					document.querySelector('.level').innerHTML = 'Уровень 3';
			  	createWallLevel2();
					setTimeout(createWallLevel2, 5000);
			  }
			  if ( score >= 30 && score <= 75 && score%5 == 0) {
			  	reCreateWall();
				}

			  //Уровень 4 (70 очков). Далее 5 бомб, 3 яблока. Каждые 5 очков пересоздаётся 2 бомбы
			if (score == 75) {
				nextLevel = 145 - score;
			document.querySelector('.next-level-score').innerHTML = nextLevel;
				document.querySelector('.level').innerHTML = 'Уровень 4';}
			if (score > 75 && score%5 == 0) {
				reCreateWall();
			}
			  //Победа (128 очков).
			if (score == 145) {
			  	finishGame();
			}
        var scoreDiv = document.getElementById('score');
				scoreDiv.innerHTML = '&nbsp;' + score;
        return true;
    }
    return false;
}

//Завершение игры
function finishGame() {


    gameIsRunning = false;
	// document.querySelector('.main-menu').style.width = '350px';
	// document.querySelector('.main-menu').style.height = '350px';
    clearInterval(snakeTimer);
	document.getElementById('snake-new-game').style.visibility = 'visible';
	document.querySelector('.difficulty').style.visibility = 'visible';
	document.getElementsByTagName('fieldset')[0].style.visibility = 'visible';
	document.querySelector('.main-menu').style.width = '70%';
	document.querySelector('.main-menu').style.height = '70%';
	document.querySelector('.main-menu').style.margin = '15%';
	document.querySelector('.your-score').innerHTML = 'Игра окончена!';

    //Чтобы победить, необходимо заполнить змейкой половину клеток
    if(score == 145) {
			document.querySelector('.your-score').innerHTML = 'Победа! Ты молодец!!';
		}
    var bestScore = document.getElementById('best-score');
    if (score > oldScore) { bestScore.innerHTML = '&nbsp;' + score; }
}

function changeDirection(event) {
	switch (event.keyCode) {
		case 27: //Esc-pause
			event.preventDefault ? event.preventDefault() : (event.returnValue=false);
			pauseForMobile();
			break;
		case 32: //Клавиша пробел - Пауза
			event.preventDefault ? event.preventDefault() : (event.returnValue=false);
			pauseForMobile();
			break;
		case 37: //Клавиша влево
			event.preventDefault ? event.preventDefault() : (event.returnValue=false);
			if (oldDirection !== 'x+') {
				direction = 'x-'
			}
			break;
		case 38: //Клавиша вверх
			event.preventDefault ? event.preventDefault() : (event.returnValue=false);
			if (oldDirection !== 'y-') {
				direction = 'y+';
			}
			break;
		case 39: //Клавиша вправо
			event.preventDefault ? event.preventDefault() : (event.returnValue=false);
			if (oldDirection !== 'x-') {
				direction = 'x+';
			}
			break;
		case 40: //Клавиша вниз
			event.preventDefault ? event.preventDefault() : (event.returnValue=false);
			if (oldDirection !== 'y+') {
				direction = 'y-';
			}
			break;
	}
}

//Удаление классов у змейки
function removeSnakeClasses() {
    snake[0].classList.contains('snake-tale');
		snake[0].style.transform = '';
		snake.splice(0, 1)[0].classList.remove('snake-tale');
		if (snake[0].classList.contains('snake-body')) {
		  snake[0].classList.remove('snake-body'); }
	if (snake[0].classList.contains('snake-turn')) {
		snake[0].classList.remove('snake-turn'); }
}

function reCreateWall() {
	var bombs = document.querySelectorAll('.wall-unit');
	var random = Math.floor(Math.random() * (bombs.length));
	bombs[random].classList.remove('wall-unit');
	createWallLevel2();
}

function pauseForMobile() {
	if (pause == false) {
		clearInterval(snakeTimer);
		pause = true;
		document.querySelector('.main-menu').style.width = '30%';
		document.querySelector('.main-menu').style.height = '10%';
		document.querySelector('.main-menu').style.margin = '45% 35%';
		document.querySelector('.pause').style.margin = '47% 42%';
		document.querySelector('.pause').style.visibility = 'visible';
		document.getElementById('pause-for-mobile').innerHTML = 'Продолжить';
		document.getElementById('pause-for-mobile').style.padding = '10px 34px';
	} else {
		snakeTimer = setInterval(move, snakeSpeed);
		pause = false;
		document.querySelector('.main-menu').style.width = '0';
		document.querySelector('.main-menu').style.height = '0';
		document.querySelector('.pause').style.visibility = 'hidden';
		document.getElementById('pause-for-mobile').innerHTML = 'Немного отдохнуть';
		document.getElementById('pause-for-mobile').style.padding = '10px';
	}
}

function touchMove() {
	wrap.addEventListener('touchstart', function (e) {
		var touchobj = e.changedTouches[0]; // первая точка прикосновения
		startx = parseInt(touchobj.clientX);
		starty = parseInt(touchobj.clientY);// положение точки касания по x, относительно левого края браузера
		e.preventDefault();
	}, false);

	wrap.addEventListener('touchend', function(e){
		var touchobj = e.changedTouches[0]; // первая точка прикосновения для данного события
		var distX = parseInt(touchobj.clientX) - startx;
		var distY = starty - parseInt(touchobj.clientY);
		e.preventDefault();

	if (oldDirection == 'y+' || oldDirection == 'y-') {
		if (distX > 20) {
			direction = 'x+'; console.log(direction);
		}
		if (distX < -20) {
			direction = 'x-'; console.log(direction);
		}
	}

	if (oldDirection == 'x+' || oldDirection == 'x-') {
		if (distY > 20) {
			direction = 'y+'; console.log(direction);
		}
		if (distY < -20) {
			direction = 'y-'; console.log(direction);
		}
	}
	}, false);
}

function playerScore() {
	var player = 0;
	return function() {
		return player++;
	}
}
