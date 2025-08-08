var Module = {
    // https://emscripten.org/docs/api_reference/module.html#Module.onRuntimeInitialized
    onRuntimeInitialized() {
      document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
    }
};
let imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');
inputElement.addEventListener('change', (e) => {
      imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);

var POINTS = 10;
var POINTSMAX = 30;
var INDIVIDUALPOPULATION = 10;
var GENERATIONS = 10;
var PERCENTAGEINDIVIDUALSMIX = 30;
var PERCENTAGESELECTION = 30;
var PERCENTAGEINDIVIDUALMUTATE = 40;


function draw(){
  let mat = new cv.Mat(imgElement.height, imgElement.width, cv.CV_8UC4);
  console.log(mat.ucharPtr(100,100))
  let p1 = new cv.Point(0, 0);
  let p2 = new cv.Point(20, 82);
  
  cv.line(mat, p1, p2, [0, 0, 0, 255], 5);
  
  cv.imshow('canvasFinal', mat);
  
  mat.delete();
}

function generateIndividual(){

  let arrayPuntos = []
  for (let i = 0; i < POINTS; i++){
    const pointX =  Math.floor(Math.random() * (imgElement.width - 0 + 1)) + 0;
    const pointY =  Math.floor(Math.random() * (imgElement.height - 0 + 1)) + 0;
    arrayPuntos.push([pointX,pointY])
  }

  let puntosIndividuo = []

  for (let i = 0; i < arrayPuntos.length; i++) {
    let p1 = new cv.Point(arrayPuntos[i][0], arrayPuntos[i][1]);
    puntosIndividuo.push(p1)
  }
  
  return puntosIndividuo;
}


function generatePoblation(){
  let arrayPoblation = [];
  for (let i = 0; i < INDIVIDUALPOPULATION; i++){
    arrayPoblation.push(generateIndividual())
  }
  return arrayPoblation;
}

//individuo = [{x: 12, y: 12},{x: 112, y: 4}]
function fitness(individuo,imagenRecibida){
  let total = 0;
  for(let i = 0; i< individuo.length; i++){
    let punto = individuo[i];
    const pixel = imagenRecibida.ucharPtr(punto.x,punto.y);
    if(pixel[0] != 0 || pixel[1] != 0 || pixel[2] != 0){
      total+=1;
    }

  }
  return total;

}
function ordenarMatrizDescendente(matriz) {
  matriz.sort((a, b) => b[0] - a[0]);
  return matriz;
}

function selection(poblation,objetivo){

  const cantidadSeleccion = (INDIVIDUALPOPULATION * PERCENTAGESELECTION)/100
  const seleccionados = [];
  for(let i = 0; i < poblation.length ; i++){
      seleccionados.push([fitness(poblation[i],objetivo),poblation[i]]);
  }
  const seleccionadosDesordenados = ordenarMatrizDescendente(seleccionados);
  const seleccionadosFinalesConNumero =  seleccionadosDesordenados.slice(0, cantidadSeleccion);
  //console.log(seleccionadosFinalesConNumero)
  console.log("fitness")
  console.log(seleccionadosFinalesConNumero[0][0])
  //elimnar el numero del puntaje
  const seleccionadosFinalesListos = seleccionadosFinalesConNumero.map(([_, texto]) => texto);
  return seleccionadosFinalesListos;

}

function reproduction(poblation,seleccion){

  for(let i = 0; i< poblation.length; i++){

    var numeroAleatorio = Math.floor(Math.random() * 100) + 1;
    if(numeroAleatorio<=PERCENTAGEINDIVIDUALSMIX){

      //OBTENER DOS PADRES DE LOS SELECCIONADOS
      const arregloSeleccionadosCopias = seleccion.slice(); 
      const arregloPadres = []

      for (let a= 0; a < 2; a++) {
          const indiceAleatorio = Math.floor(Math.random() * arregloSeleccionadosCopias.length);
          const elementoAleatorio = arregloSeleccionadosCopias[indiceAleatorio];
          arregloPadres.push(elementoAleatorio);
      }

      //PRUEBA 1 REPRODUCCION
      let padre1 = false;
      for (let x = 0; x < poblation[i].length; x++) {//estamos en el individuo
        
        if(padre1){
          poblation[i][x] = arregloPadres[0][x];
          padre1 = false;
        }else{
          poblation[i][x] = arregloPadres[1][x];
          padre1 = true;
        }
        
      }
    }

  }
  return poblation;
}

function mutation(poblation){
  
  const poblacionCopia = poblation.slice();

  for(let i = 0; i< poblation.length; i++){

    var numeroAleatorio = Math.floor(Math.random() * 100) + 1;
    if(numeroAleatorio<=PERCENTAGEINDIVIDUALMUTATE){
      
      //mejorar la ubiacion de cada punto
      for(let p = 0; p< poblacionCopia[i].length; p++){

        let punto = poblacionCopia[i][p];

        const coordenadasMejoradas = aproximacionCoordenada(punto.x,punto.y);
        const puntoNuevasCoordenadas = new cv.Point(coordenadasMejoradas.x, coordenadasMejoradas.y);
        poblacionCopia[i][p] = puntoNuevasCoordenadas;

      }
          
    }POINTSMAX
    if(poblacionCopia[i].length <= POINTSMAX){
      const pointX =  Math.floor(Math.random() * (imgElement.width - 0 + 1)) + 0;
      const pointY =  Math.floor(Math.random() * (imgElement.height - 0 + 1)) + 0;
      const p1 = new cv.Point(pointX, pointY);
      //console.log(p1)
      poblacionCopia[i].push(p1);
    }
    
    
  }
  return poblacionCopia
}
function validarCoordenada(targetX, targetY) {
  const objetivo = cv.imread(imgElement);

  let gray = new cv.Mat();
  cv.cvtColor(objetivo, gray, cv.COLOR_RGBA2GRAY);

  let binary = new cv.Mat();
  cv.threshold(gray, binary, 0, 255, cv.THRESH_BINARY_INV | cv.THRESH_OTSU);

  for (let y = 0; y < binary.rows; y++) {
    for (let x = 0; x < binary.cols; x++) {
      let pixelValue = binary.ucharPtr(y, x)[0];

      if (pixelValue === 0 && x === targetX && y === targetY) {
        return true;
      }
    }
  }

  return false;
}
function aproximacionCoordenada(targetX,targetY) {
  const objetivo = cv.imread(imgElement);

  let gray = new cv.Mat();
  cv.cvtColor(objetivo, gray, cv.COLOR_RGBA2GRAY);

  let binary = new cv.Mat();
  cv.threshold(gray, binary, 0, 255, cv.THRESH_BINARY_INV | cv.THRESH_OTSU);

  let minDistance = Infinity;
  let puntoCercano = null;
  for (let y = 0; y < binary.rows; y++) {

    for (let x = 0; x < binary.cols; x++) {
      
      let pixelValue = binary.ucharPtr(y, x)[0];
      //console.log(pixelValue)
      if (pixelValue == 0) {
        //super formula
        let distance = Math.sqrt(Math.pow(x - targetX, 2) + Math.pow(y - targetY, 2));

        if (distance < minDistance) {
          minDistance = distance;
          puntoCercano = { x, y };
          //console.log(puntoCercano)
        }
      }
    }
  }

  return puntoCercano;
}

function geneticAlgorithm() {
  document.getElementById('totalTime').textContent = 'Total time: 0';
  document.getElementById('procesoResultado').textContent = 'Processing image...';
  document.getElementById('mensajeFinal').textContent = '';
  setear();
  var buttonChange = document.getElementById("buttonChange");
  buttonChange.disabled = true;

  var startTimeTotal = new Date();
  var totalTimePromedio = 0;

  let objetivo = cv.imread(imgElement);
  let generaciones = [];
  let poblacion = generatePoblation();
  let i = 0;

  function runIteration() {
    console.log("generacion:" + (i + 1));
    document.getElementById('creacionGeneracionActual').innerHTML = 'Current generation of genetic algorithm: ' + (i+ 1);
    var startTimePromedio = performance.now();

    const copiaPoblacion = JSON.parse(JSON.stringify(poblacion));

    let seleccionados = selection(copiaPoblacion, objetivo);

    const poblacionReproducida = reproduction(JSON.parse(JSON.stringify(poblacion)), seleccionados);
    //console.log("reproducidos")
    //console.log(poblacionReproducida)

    const poblacionMutacion = mutation(JSON.parse(JSON.stringify(poblacionReproducida)));
    //console.log("poblacion mutada")
    //console.log(poblacionMutacion)

    generaciones.push(JSON.parse(JSON.stringify(poblacionMutacion)));
    poblacion = JSON.parse(JSON.stringify(poblacionMutacion));

    var endTimePromedio = performance.now();
    totalTimePromedio += endTimePromedio - startTimePromedio;
    document.getElementById("timeGenerations").textContent = 'Average time for generations: ' + ((totalTimePromedio/GENERATIONS)/ 1000).toFixed(2)+ ' seg';

    i++;

    

    if (i < GENERATIONS) {
      setTimeout(runIteration, 0);
    } else {
      var endTimeTotal = new Date(); 
      var tiempoTotal = Math.floor((endTimeTotal - startTimeTotal) / 1000);
      document.getElementById("totalTime").textContent = 'Total time: ' + tiempoTotal + ' seg';

      document.getElementById('procesoResultado').textContent = 'Showing result:';

      setTimeout(() => {
        console.log(generaciones);
        mostrarGeneracion(generaciones);
      }, 0);
    }
  }

  runIteration();
}



function mostrarIndividuo(individuo){
  individuo = ordenamientoCoordenadas(individuo);
  let mat = new cv.Mat.zeros(imgElement.height, imgElement.width, cv.CV_8UC4);

  for (let i = 0; i < individuo.length-1; i++) {
    cv.line(mat, individuo[i], individuo[i+1], [0, 0, 0, 255], 1);
  }
  cv.imshow('canvasFinal', mat);
  mat.delete();
}
function ordenamientoCoordenadas(coordenadas){

  // Función de comparación para ordenar las coordenadas por cercanía
  function compararCercania(coordA, coordB) {
    const distanciaA = Math.sqrt(coordA.x * coordA.x + coordA.y * coordA.y);
    const distanciaB = Math.sqrt(coordB.x * coordB.x + coordB.y * coordB.y);
    return distanciaA - distanciaB;
  }
  
  // Ordenar el arreglo de coordenadas por cercanía
  coordenadas.sort(compararCercania);
  
  return coordenadas;
}

function mostrarGeneracion(generacion) {
  let tiempoEspera = 200;

  for (let g = 0; g < generacion.length; g++) {
    setTimeout(() => {
      document.getElementById('currentGeneration').innerHTML = 'Current generation: ' + (g + 1);

      for (let i = 0; i < generacion[g].length; i++) {
        setTimeout(() => {
          mostrarIndividuo(generacion[g][i]);
        }, tiempoEspera * (i + 1));
      }
    }, tiempoEspera * (g + 1) * generacion[g].length);
  }

  setTimeout(() => {
    document.getElementById('mensajeFinal').textContent = 'Algorithm finished';
  }, tiempoEspera * generacion.length * generacion[generacion.length - 1].length + tiempoEspera);
}

document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const imgElement = document.getElementById('imageSrc');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imgElement.src = e.target.result;
            imgElement.style.display = 'block';
            imgElement.alt = 'Selected Image';
        };
        reader.readAsDataURL(file);
    }
});


const inputOutput = document.querySelector('.inputoutput');

inputOutput.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.style.borderColor = '#6c63ff';
    this.style.background = '#2f2f2f';
});

inputOutput.addEventListener('dragleave', function(e) {
    e.preventDefault();
    this.style.borderColor = '#3a3a3a';
    this.style.background = '#2a2a2a';
});

inputOutput.addEventListener('drop', function(e) {
    e.preventDefault();
    this.style.borderColor = '#3a3a3a';
    this.style.background = '#2a2a2a';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            const imgElement = document.getElementById('imageSrc');
            
            reader.onload = function(e) {
                imgElement.src = e.target.result;
                imgElement.style.display = 'block';
                imgElement.alt = 'Selected Image';
            };
            reader.readAsDataURL(file);
            
            // Actualizar también el input file
            document.getElementById('fileInput').files = files;
        }
    }
});

function downloadSampleImages() {7
    const downloadUrl = "https://drive.google.com/drive/u/0/folders/1rrGzD_VNUAa-IWaH6kaKCcEej97xg6Ci";

    window.open(downloadUrl, '_blank');
}

function updateNumber(text,value,idp) {
  document.getElementById(idp).textContent = text + value;
}
function updateNumberPorcentaje(text,value,idp) {
  document.getElementById(idp).innerText = text + value + '%';
}

function setear(){
  POINTS = document.getElementById('sliderPOINTS').value;
  POINTSMAX = document.getElementById('sliderPOINTSMAX').value;
  GENERATIONS = document.getElementById('sliderGENERATIONS').value;
  INDIVIDUALPOPULATION = document.getElementById('sliderINDIVIDUALS').value;
  PERCENTAGESELECTION = parseInt(document.getElementById('sliderPercentageIndividualsGeneration').value);
  PERCENTAGEINDIVIDUALMUTATE = parseInt(document.getElementById('sliderIndividualMutate').value);
  PERCENTAGEINDIVIDUALSMIX = parseInt(document.getElementById('sliderIndividualMix').value);

  if((PERCENTAGESELECTION + PERCENTAGEINDIVIDUALMUTATE + PERCENTAGEINDIVIDUALSMIX)>100){
      alert("the percentages entered sum a percentage greater than 100%")
  }else{
      alert("Changes saved");
  }
  
}

function reiniciar() {
  window.location.reload();
}