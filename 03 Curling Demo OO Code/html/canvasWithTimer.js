let timer //timer for animating motion
let canvas = document.getElementById('canvas1') //our drawing canvas
let iceSurface = new Ice(canvas)
let shootingArea = iceSurface.getShootingArea()
let stoneRadius = iceSurface.nominalStoneRadius()

function initStones(){
  allStones = new SetOfStones() //set of all stones. sorted by lying score
  homeStones = new SetOfStones() //set of home stones in no particular order
  visitorStones = new SetOfStones() //set of visitor stones in no particular order
  shootingQueue = new Queue() //queue of stones still to be shot

  //create stones
  for(let i=0; i<STONES_PER_TEAM; i++){
    let homeStone = new Stone(0, 0, stoneRadius, HOME_COLOUR)
    let visitorStone = new Stone(0, 0, stoneRadius, VISITOR_COLOUR)
    homeStones.add(homeStone)
    visitorStones.add(visitorStone)
    allStones.add(homeStone)
    allStones.add(visitorStone)
  }
}

function stageStones(){
  console.log("staging stones")
  for(let i=0; i<STONES_PER_TEAM; i++){
    homeStones.elementAt(i).setLocation({x:shootingArea.x + stoneRadius, y:shootingArea.height - (stoneRadius + (STONES_PER_TEAM-i-1)*stoneRadius*2)})
    visitorStones.elementAt(i).setLocation({x:shootingArea.x + shootingArea.width - stoneRadius, y:shootingArea.height - (stoneRadius + (STONES_PER_TEAM-i-1)*stoneRadius*2)})
  }
}

function stageShootingQueue(){
  shootingQueue = new Queue()
  console.log("staging shooting queue" + " isHomeClient: " + isHomeClient + ", isVisitorClient: " + isVisitorClient)
  for(let i=0; i<STONES_PER_TEAM; i++){
    if(isHomeClient){
      shootingQueue.enqueue(homeStones.elementAt(i))
    }
    if(isVisitorClient){
      shootingQueue.enqueue(visitorStones.elementAt(i))
    }
  }
}

initStones()
stageStones()
whosTurnIsIt = HOME_COLOUR

function printAllStones(){
  var stoneSet = JSON.stringify(allStones)
  socket.emit('stoneStatus', stoneSet);
}

function sendCurrentTurn() {
  socket.emit("whosTurn", whosTurnIsIt)
}


socket.on('whosTurn', function(msg){
  console.log('New Turn: ' + msg)
  whosTurnIsIt = msg
})

socket.on('stoneStatus', function(msg){
  newPositions = JSON.parse(msg)
  newStones = newPositions.collection
  for(let i = 0; i<allStones.size(); i++){
    currentStone = newStones[i]
    allStones.elementAt(i).x = currentStone.x
    allStones.elementAt(i).y = currentStone.y
    allStones.elementAt(i).velocityX = currentStone.velocityX
    allStones.elementAt(i).velocityY = currentStone.velocityY
    allStones.elementAt(i).isMoving = currentStone.isMoving
    allStones.elementAt(i).colour = currentStone.colour
  }
})

socket.on('newStart', function(msg){
  console.log('New Starting Player: ' + msg)
  whosTurnIsIt = msg
})

let setOfCollisions = new SetOfCollisions()

let stoneBeingShot = null //Stone instance: stone being shot with mouse
let shootingCue = null //Cue instance: shooting cue used to shoot ball with mouse


let fontPointSize = 18 //point size for chord and lyric text
let editorFont = 'Courier New' //font for your editor -must be monospace font

function distance(fromPoint, toPoint) {
  //point1 and point2 assumed to be objects like {x:xValue, y:yValue}
  //return "as the crow flies" distance between fromPoint and toPoint
  return Math.sqrt(Math.pow(toPoint.x - fromPoint.x, 2) + Math.pow(toPoint.y - fromPoint.y, 2))
}

function drawCanvas() {

  const context = canvas.getContext('2d')

  context.fillStyle = 'white'
  context.fillRect(0, 0, canvas.width, canvas.height) //erase canvas


  //draw playing surface
  iceSurface.draw(context, whosTurnIsIt)

  context.font = '' + fontPointSize + 'pt ' + editorFont
  context.strokeStyle = 'blue'
  context.fillStyle = 'red'

  //draw the stones
  allStones.draw(context, iceSurface)
  if (shootingCue != null) shootingCue.draw(context)

  //draw the score (as topmost feature).
  iceSurface.drawScore(context, score)
}
