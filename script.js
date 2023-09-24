const optionContainer = document.querySelector(".option-container")
const flipBtn = document.querySelector("#flip-button")
const GamesBoard = document.querySelector('#gameboard-container')
const startBtn = document.querySelector('#start-button')
const infoDisplay = document.querySelector('#info')
const turnDisplay = document.querySelector('#turn-display')

let angle = 0

function flip(){
    const optionShips = Array.from(optionContainer.children)
    angle = angle === 0 ? 90 : 0 ;
    optionShips.forEach(optionship => optionship.style.transform = `rotate(${angle}deg)`)

}

const width = 10

function createGameBoard(color , user) {
    const gameBoardContainner = document.createElement('div')
    gameBoardContainner.classList.add('game-board')
    gameBoardContainner.style.backgroundColor = color
    gameBoardContainner.id = user
    
    for(let i = 0 ;  i < width*width ; i++) {
        const block = document.createElement('div')
        block.classList.add('block')
        block.id = i
        gameBoardContainner.appendChild(block)
    }

    GamesBoard.appendChild(gameBoardContainner)
}

flipBtn.addEventListener("click" , flip)
createGameBoard('yellow' , 'player')
createGameBoard('pink' , 'computer')


class Ship {
    constructor(name , length) {
        this.name = name
        this.length = length
    }


}

const destroyer = new Ship('destroyer' , 2)
const submarine = new Ship('submarine' , 3)
const cruiser = new Ship('cruiser' , 3)
const battleship = new Ship('battleship' , 5)
const carrier = new Ship('carrier' , 4)

const ships = [destroyer , submarine , cruiser , battleship , carrier]
let notDropped 

function handleValidity(allBoardBlocks , isHorizontal , startIndex , ship) {
    let validStart =  isHorizontal ? startIndex <= width*width - ship.length ? startIndex : width*width - ship.length 
    // vertical
    :
    startIndex <= width*width - width*ship.length ? startIndex : startIndex - ship.length * width + width

    let shipblocks = []

    for(let i = 0 ; i < ship.length ; i++) {
        if(isHorizontal) {
            shipblocks.push(allBoardBlocks[Number(validStart) + i])
        }
        else {
            shipblocks.push(allBoardBlocks[Number(validStart) + i * width])
        }
    }

    let valid

    if(isHorizontal){
        shipblocks.every((_shipblock , index) =>
           valid = shipblocks[0].id % width !== width - (shipblocks.length - (index + 1))
        )

    }else {
        shipblocks.every((_shipblock , index) =>
            valid = shipblocks[0].id < 90 + (width*index + 1)
        )
    }

    const notTaken = shipblocks.every(shipblock => !shipblock.classList.contains('taken'))

    return {shipblocks , valid , notTaken}
}

function addShipPiece(user , ship , startId) {
    const allBoardBlocks = document.querySelectorAll(`#${user} div`)
    let randomBoolean = Math.random() < 0.5
    let isHorizontal = user === 'player' ? angle === 0 : randomBoolean

    let randomStartIndex = Math.floor(Math.random() *width*width)

    let startIndex = startId ? startId : randomStartIndex

    const {shipblocks , valid , notTaken} = handleValidity(allBoardBlocks , isHorizontal , startIndex , ship)
    
    if (valid && notTaken) {
        shipblocks.forEach(shipblock => {
            shipblock.classList.add(ship.name)
            shipblock.classList.add('taken')
        })
    }
    else {
        if(user === 'computer') addShipPiece(user,ship , startId)
        if(user === 'player') notDropped = true
    }

    

}

ships.forEach(ship => addShipPiece('computer' , ship))

// Drag player ship
let draggedShip

const optionShips =  Array.from(optionContainer.children)

optionShips.forEach(optionShip => optionShip.addEventListener('dragstart' , dragstart))

const allPlayerBlocks = document.querySelectorAll("#player div")
allPlayerBlocks.forEach(playerBlock => {
    playerBlock.addEventListener('dragover' , dragover)
    playerBlock.addEventListener('drop' , dropShip)
})

function dragstart(e) {
    notDropped = false
    draggedShip = e.target
}

function dragover(e) {
    e.preventDefault()
    const ship = ships[draggedShip.id]
    HightLightArea(e.target.id , ship)
}

function dropShip(e) {
    const startId = e.target.id
    const ship = ships[draggedShip.id]
    addShipPiece('player' ,ship , startId )

    if(!notDropped) {
        draggedShip.remove()
    }
    
}


// Add highlight
function HightLightArea(startIndex , ship) {
    const allBoardBlocks = document.querySelectorAll('#player div')
    let isHorizontal = angle === 0

    const {shipblocks , valid , notTaken} = handleValidity(allBoardBlocks , isHorizontal , startIndex , ship)

    if(valid && notTaken) {
        shipblocks.forEach(shipblock => {
            shipblock.classList.add('hover')
            setTimeout(() => shipblock.classList.remove('hover') , 500)
        })
    }
}


// game logic

let gameOver = false
let playerTurn 

function startGame() {
    if(playerTurn === undefined) {
        if(optionContainer.children.length != 0) {
            infoDisplay.textContent = "Please place all the blocks"
    
        }
        else {
            const allBoardBlocks = document.querySelectorAll('#computer div')
            allBoardBlocks.forEach(block => block.addEventListener('click' , handleClick))
        }
        playerTurn = true
        turnDisplay.textContent = 'You Go'
        infoDisplay.textContent = 'the game has started'
    }
    
}

let playerHits = []
let computerHits = []
const playerSunkShips = []
const computerSunkShips = []

function handleClick(e) {
    if(!gameOver) {
        if(e.target.classList.contains('taken')) {
            e.target.classList.add('boom')
            infoDisplay.textContent = 'you hit computer ship'

            let classes = Array.from(e.target.classList)
            classes.filter(className => className !== 'block')
            classes.filter(className => className !== 'boom')
            classes.filter(className => className !== 'taken')

            playerHits.push(...playerHits)
            checkScore('player' , playerHits , playerSunkShips)
        }

        if(!e.target.classList.contains('taken')) {
            infoDisplay.textContent = 'Nothing hit this time'
            e.target.classList.add('empty')
        }

        playerTurn = false
        const allBoardBlocks = document.querySelectorAll('#computer div')
        // remove all block addEventListener
        allBoardBlocks.forEach(block =>  block.replaceWith(block.cloneNode(true)))
        setTimeout(computerGo , 3000)

    }
}

startBtn.addEventListener('click' , startGame)

// Define the computer go
function computerGo() {
    if(!gameOver) {
        turnDisplay.textContent = 'Computer go'
        infoDisplay.textContent = 'The computer is thinking!'

        setTimeout(() => {
            let randomGo = Math.floor(Math.random()*width*width)
            const allBoardBlocks = document.querySelectorAll('#player div')

            if(allBoardBlocks[randomGo].classList.contains('taken') && 
            allBoardBlocks[randomGo].classList.contains('boom')) {
                computerGo()
                return
            }
            else if (allBoardBlocks[randomGo].classList.contains('taken') && 
            !allBoardBlocks[randomGo].classList.contains('boom')) {

                allBoardBlocks[randomGo].classList.add('boom')
                infoDisplay.textContent = 'the computer hit your ship'

                let classes = Array.from(e.allBoardBlocks[randomGo].classList)
                classes.filter(className => className !== 'block')
                classes.filter(className => className !== 'boom')
                classes.filter(className => className !== 'taken')
    
                computerHits.push(...playerHits)
                checkScore('computer' , computerHits , computerSunkShips)

            }
            else {
                infoDisplay.textContent = 'Nothing hit this time'
                allBoardBlocks[randomGo].classList.add('empty')
            }

        } , 3000)

        setTimeout(() => {
            playerTurn = true
            turnDisplay.textContent = 'Player turn'
            infoDisplay.textContent = 'please take you go'

            const allBoardBlocks = document.querySelectorAll('#computer div')
            allBoardBlocks.forEach(block => block.addEventListener('click' , handleClick))
        } , 6000)
    }
}

function checkScore(user , userHit , userSunkShips) {

    function checkShip(shipName , shipLength) {
        if (
            userHit.filter(storedShipName => storedShipName === shipName).length = shipLength

        ) {
            
            if(user === 'player') {
                infoDisplay.textContent = `you sunk the ${user}'s ${shipName}`
                playerHits = userHit.filter(storedShipName => storedShipName !== shipName)
            }

            if(user === 'computer') {
                infoDisplay.textContent = `computer sunk the ${user}'s ${shipName}`
                computerHits = userHit.filter(storedShipName => storedShipName !== shipName)
            }
            userSunkShips.push(shipName)
        }
    }

    checkShip('destroyer' , 2)
    checkShip('submarine' , 3)
    checkShip('cruiser' , 3)
    checkShip('battleship' , 4)
    checkShip('carrier' , 5)

    if(playerSunkShips.length === 5) {
        infoDisplay.textContent = 'You sunk every computer ship , you Won'
        gameOver = true
    }
    if(computerSunkShips.length === 5) {
        infoDisplay.textContent = 'computer sunk all your ship , You Lose'
        gameOver = true
    }
}