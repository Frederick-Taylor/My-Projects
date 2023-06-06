function handleJoinAsHomeButton(){
  console.log(`handleJoinAsHomeButton()`)
  let btn = document.getElementById("JoinAsHomeButton")
  btn.disabled = true //disable button
  btn.style.backgroundColor="lightgray"
  if(!isHomePlayerAssigned){
    isHomePlayerAssigned = true
    isHomeClient = true
  }
  
  var testing = JSON.stringify({"HomePlayer":socket.id})
  socket.emit('NewHomePlayer', testing)

  stageShootingQueue()
}

function handleJoinAsVisitorButton(){
  console.log(`handleJoinAsVisitorButton()`)
  let btn = document.getElementById("JoinAsVisitorButton")
  btn.disabled = true //disable button
  btn.style.backgroundColor="lightgray"
  if(!isVisitorPlayerAssigned) {
    isVisitorPlayerAssigned = true
    isVisitorClient = true
  }

  var testing = JSON.stringify({"VisitorPlayer":socket.id})
  socket.emit('NewVisitorPlayer', testing)

  stageShootingQueue()
}

function handleJoinAsSpectatorButton(){
  console.log(`handleJoinAsSpectatorButton()`)
  let btn = document.getElementById("JoinAsSpectatorButton")
  btn.disabled = true //disable button
  btn.style.backgroundColor="lightgray"

  if(!isSpectatorClient) isSpectatorClient = true

  socket.emit('NewSpectator')
}
