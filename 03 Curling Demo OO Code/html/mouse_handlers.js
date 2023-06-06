function getCanvasMouseLocation(e) {
  //provide the mouse location relative to the upper left corner
  //of the canvas
  let rect = canvas.getBoundingClientRect()

  //account for amount the document scroll bars might be scrolled

  //get the scroll offset
  const element = document.getElementsByTagName("html")[0]
  let scrollOffsetX = element.scrollLeft
  let scrollOffsetY = element.scrollTop

  let canX = e.pageX - rect.left - scrollOffsetX
  let canY = e.pageY - rect.top - scrollOffsetY

  return {
    x: canX,
    y: canY
  }
}

function setupNewGame(){
  console.log('Starting New Game')
  socket.emit('newGame', '')
}

socket.on('newGame', function(data){
  console.log('Starting New Game')
  initStones()
  stageStones()
  stageShootingQueue()
})

function handleMouseDown(e) {
  console.log('Shooting Queue: ' + shootingQueue)
  console.log('Shooting Value: ' + enableShooting)
  if(enableShooting === false) return //cannot shoot when stones are in motion
  console.log('Current Turn: ' + whosTurnIsIt)
  console.log('!isClientFor(whosTurnIsIt) ' + !isClientFor(whosTurnIsIt))
  console.log('isHomeClient ' + isHomeClient)
  console.log('isVisitorClient ' + isVisitorClient)
  if(!isClientFor(whosTurnIsIt)) return //only allow controlling client

  let canvasMouseLoc = getCanvasMouseLocation(e)
  let canvasX = canvasMouseLoc.x
  let canvasY = canvasMouseLoc.y

  stoneBeingShot =allStones.stoneAtLocation(canvasX, canvasY)
  console.log('Starting')
  if(stoneBeingShot === null){
    console.log('Ready to Fire')
    if(iceSurface.isInShootingCrosshairArea(canvasMouseLoc)){
      console.log('Cursor in Area')
      if(shootingQueue.isEmpty()){
        console.log('Shooting Queue Empty')
        initStones()
        console.log('Staging Stones')
        stageStones()
        console.log('Staging Shooting Queue')
        stageShootingQueue()
        setupNewGame()
      }
      stoneBeingShot = shootingQueue.front()
      stoneBeingShot.setLocation(canvasMouseLoc)
      //we clicked near the shooting crosshair
    }
  }

  if (stoneBeingShot != null) {
    shootingCue = new Cue(canvasX, canvasY)
    document.getElementById('canvas1').addEventListener('mousemove', handleMouseMove)
    document.getElementById('canvas1').addEventListener('mouseup', handleMouseUp)

  }

  // Stop propagation of the event and stop any default
  //  browser action
  e.stopPropagation()
  e.preventDefault()

  printAllStones()
}

function handleMouseMove(e) {
  let canvasMouseLoc = getCanvasMouseLocation(e)
  let canvasX = canvasMouseLoc.x
  let canvasY = canvasMouseLoc.y


  if (shootingCue != null) {
    shootingCue.setCueEnd(canvasX, canvasY)
  }

  e.stopPropagation()

  printAllStones()
}

function trackDequeue(){
  let currentScore = JSON.stringify(score)
  socket.emit('trackDequeue', currentScore)
}

function handleMouseUp(e) {
  e.stopPropagation()
  if (shootingCue != null) {
    let cueVelocity = shootingCue.getVelocity()
    if (stoneBeingShot != null) stoneBeingShot.addVelocity(cueVelocity)
    shootingCue = null
    shootingQueue.dequeue()
    
    enableShooting = false //disable shooting until shot stone stops
    
    if (isHomeClient)  {
      whosTurnIsIt = VISITOR_COLOUR
    } else if (isVisitorClient) {
      whosTurnIsIt = HOME_COLOUR
    }
    
    sendCurrentTurn()
    trackDequeue()
  }

  //remove mouse move and mouse up handlers but leave mouse down handler
  document.getElementById('canvas1').removeEventListener('mousemove', handleMouseMove)
  document.getElementById('canvas1').removeEventListener('mouseup', handleMouseUp)

  console.log('Shooting Queue after mouse up: ' + shootingQueue)
  printAllStones()
}
