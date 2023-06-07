var Module = {
    // https://emscripten.org/docs/api_reference/module.html#Module.onRuntimeInitialized
    onRuntimeInitialized() {
      document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
    }
};
function onOpenCvReady() {
    document.getElementById('fileInput').addEventListener('change', function (e) {
        var file = e.target.files[0];
        var reader = new FileReader();

        reader.onload = function (event) {
            var img = new Image();
            img.onload = function () {
                var canvas = document.getElementById('canvas');
                var ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

var GENERATIONS = 50;
var INDIVIDUALPOPULATION = 100;
var PERCENTAGESELECTION = 20;
var PERCENTAGEINDIVIDUALMUTATE = 40;
var PERCENTAGEINDIVIDUALSMIX = 40;

var blanco = [230,255]
var negro = [0,25]

var DISPLAYTOP = true;

function generarPixel() {
    var random = Math.random();
    if (random < 0.5) {
        red = Math.floor(Math.random() * (blanco[1] - blanco[0] + 1)) + blanco[0]
        green = Math.floor(Math.random() * (blanco[1] - blanco[0] + 1)) + blanco[0]
        blue = Math.floor(Math.random() * (blanco[1] - blanco[0] + 1)) + blanco[0]
        return [red,green,blue,255]
      } else {
        
        red =Math.floor(Math.random() * (negro[1] - negro[0] + 1)) + negro[0];
        green = Math.floor(Math.random() * (negro[1] - negro[0] + 1)) + negro[0];
        blue = Math.floor(Math.random() * (negro[1] - negro[0] + 1)) + negro[0];

        return [red,green,blue,255]
      }
}
function nuevoIndividuo(arregloObjetivo){

    const pixelMatrix = [];
    for (let y = 0; y < arregloObjetivo.length; y++) {
        const row = [];
        for (let x = 0; x < arregloObjetivo[y].length; x++) {

            row.push(generarPixel());
          
        }
        pixelMatrix.push(row);
    }
    return pixelMatrix;
}
window.onload = function() {
    onOpenCvReady();
};
function createPoblacion(){
    const objetivo = guardarMatrizObjetivo();
    const populationStart = []
    for(let i = 0; i<INDIVIDUALPOPULATION; i++){
        populationStart.push(nuevoIndividuo(objetivo))
    }
    return populationStart;
}
function ordenarMatrizDescendente(matriz) {
    matriz.sort((a, b) => b[0] - a[0]);
    return matriz;
}
function fitness(individuo,objetivo){
    let total = 0;
    for(let f = 0; f< individuo.length; f++){

        for(let y = 0; y< individuo[f].length; y++){
            const sumaIndividuo = individuo[f][y][0] + individuo[f][y][1] + individuo[f][y][2]
            const sumaObjetivo = objetivo[f][y][0] + objetivo[f][y][1] + objetivo[f][y][2]
            if(Math.abs(sumaIndividuo - sumaObjetivo) <= 20){
                total +=1;
            }
        }
        
        
    }
    return total;
}
function selection(poblation,objetivo){
    const cantidadSeleccion = (INDIVIDUALPOPULATION * PERCENTAGESELECTION)/100
    const seleccionados = [];
    for(let i = 0; i < poblation.length ; i++){
        seleccionados.push([fitness(poblation[i],objetivo),poblation[i]])
    }
    const seleccionadosDesordenados = ordenarMatrizDescendente(seleccionados)
    const seleccionadosFinalesConNumero =  seleccionadosDesordenados.slice(0, cantidadSeleccion);

    console.log("fitness")
    console.log(seleccionadosFinalesConNumero[0][0])

    //elimnar el numero del puntaje
    const seleccionadosFinalesListos = seleccionadosFinalesConNumero.map(([_, texto]) => texto);
    return seleccionadosFinalesListos;

}
function reproduction(poblation,seleccion){
    const cantidadReproducir = (INDIVIDUALPOPULATION * PERCENTAGEINDIVIDUALSMIX)/100
    for(let i = 0; i< cantidadReproducir; i++){//estamos en el individuo
        
        //OBTENER DOS PADRES DE LOS SELECCIONADOS
        const arregloSeleccionadosCopias = seleccion.slice(); 
        const arregloPadres = []
        for (let a= 0; a < 2; a++) {
            const indiceAleatorio = Math.floor(Math.random() * arregloSeleccionadosCopias.length);
            const elementoAleatorio = arregloSeleccionadosCopias.splice(indiceAleatorio, 1)[0];
            arregloPadres.push(elementoAleatorio);
        }
        //PRUEBA 1 REPRODUCCION COPIAS FILAS INTERCALADAMENTE DE PADRES
        let turnoPadre1 = false;
        for (let x = 0; x < poblation[i].length; x++) { //estamos en la fila

            for (let y = 0; y < poblation[i][x].length; y++) {
                if(turnoPadre1){
                    poblation[i][x][y] = arregloPadres[0][x][y]
                    turnoPadre1 = false;
                }else{
                    poblation[i][x][y] = arregloPadres[1][x][y]
                    turnoPadre1 =true;
                }
              
            }
        }
    }
    return poblation;
}
function mutation(poblation,objetivo){
    const cantidadMutar = (INDIVIDUALPOPULATION * PERCENTAGEINDIVIDUALMUTATE)/100
    //MUTACION hard

    for(let i = 0; i< cantidadMutar; i++){//ahora estando en cada individuo
        
        for(let x = 0; x< poblation[i].length; x++){

            let tasaMutacionDeFila = Math.floor(Math.random() * ((poblation[i][x].length)/24 - 5 + 1)) + 5;

            while(tasaMutacionDeFila!=0){
                const y =  Math.floor(Math.random() * ((poblation[i][x].length-1) - 0 + 1)) + 0;
                const sumaIndividuo = poblation[i][x][y][0] + poblation[i][x][y][1] + poblation[i][x][y][2]
                const sumaObjetivo = objetivo[x][y][0] + objetivo[x][y][1] + objetivo[x][y][2]
                if(!(Math.abs(sumaIndividuo - sumaObjetivo) <= 20)){
                    poblation[i][x][y] = objetivo[x][y];
                   
                }
                tasaMutacionDeFila-=1;
            }
        }

    }
    return poblation
}
async function geneticAlgorithm() {
    //
    document.getElementById('totalTime').textContent = 'Total time: 0'
    document.getElementById('procesoResultado').textContent = 'Processing image...';
    document.getElementById('mensajeFinal').textContent = '';
    var button = document.getElementById("buttonApply");
    button.disabled = true;
    var buttonChange = document.getElementById("buttonChange");
    buttonChange.disabled = true;

    //tiempo
    var startTimeTotal = new Date();
    var totalTimePromedio = 0;
    //
    const objetivo = guardarMatrizObjetivo();
    let poblacion = createPoblacion();
    for (let i = 1; i <= GENERATIONS; i++) {

        document.getElementById('currentGeneration').innerHTML ='Current generation: ' + i;

        var startTimePromedio = performance.now();

        const copiaPoblacion = poblacion.slice(); // Crear una copia de la poblacion pa q no modifique la original
    
        const seleccion = selection(copiaPoblacion, objetivo);

        const nuevaPoblacion = reproduction(poblacion, seleccion, objetivo);
    
        const poblacionMutada = mutation(nuevaPoblacion,objetivo);


        await new Promise((resolve) => {
            mostrarIndividuo(poblacionMutada, resolve); // Pasar la función resolve como callback a magia
        });
        var endTimePromedio = performance.now();
        totalTimePromedio += endTimePromedio - startTimePromedio;
        document.getElementById("timeGenerations").textContent = 'Average time for generations: ' + ((totalTimePromedio/GENERATIONS)/ 1000).toFixed(2)+ ' seg';

        poblacion = poblacionMutada.slice();
    }

    var endTimeTotal = new Date(); 
    var tiempoTotal = Math.floor((endTimeTotal - startTimeTotal) / 1000);
    document.getElementById("totalTime").textContent = 'Total time: ' + tiempoTotal + ' seg';

    document.getElementById('procesoResultado').textContent = 'Result final:';
    document.getElementById('mensajeFinal').textContent = 'algorithm finished';
    button.disabled = false;
    buttonChange.disabled = false;
}

function setear(){
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




function guardarMatrizObjetivo(){

    const canvas = document.getElementById('canvas');

    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const pixelMatrix = [];

    const pixels = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
          const index = (y * width + x) * 4;
          const red = pixels[index];
          const green = pixels[index + 1];
          const blue = pixels[index + 2];
          const alpha = pixels[index + 3];

          row.push([ red, green, blue, alpha ]);
          
        }
        pixelMatrix.push(row);
    }
    return pixelMatrix;

}

function mostrarCanva(arregloMostrar){
    const arregloObjetivo = arregloMostrar;
    const canvas = document.getElementById('canvasFinal');
    canvas.width = arregloObjetivo[0].length;
    canvas.height = arregloObjetivo.length;
    const ctx = canvas.getContext('2d');

    const imageData = ctx.createImageData(canvas.width, canvas.height);

  for (let y = 0; y < arregloObjetivo.length; y++) {
    for (let x = 0; x < arregloObjetivo[y].length; x++) {
      const pixel = arregloObjetivo[y][x];
      const index = (y * canvas.width + x) * 4;
      imageData.data[index] = pixel[0];   
      imageData.data[index + 1] = pixel[1]; 
      imageData.data[index + 2] = pixel[2]; 
      imageData.data[index + 3] = pixel[3]; 
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function mostrarIndividuo(mostrar, callback) {
    let i = 0;
    var cantMos = mostrar.length*0.05;
    if(!DISPLAYTOP){
        cantMos = mostrar.length
    }
    function loop() {
        mostrarCanva(mostrar[i]);
      i += 1;
  
      if (i < cantMos) {
        setTimeout(loop, 100);
      } else {
        callback(); 
      }
    }
  
    loop();
}

function cambiarMostrar(){
    if(DISPLAYTOP){
        DISPLAYTOP = false;
        document.getElementById('displayIndividual').textContent = 'Display every individual in the population at every millisecond';
    }else{
        DISPLAYTOP = true;
        document.getElementById('displayIndividual').textContent = 'Display 5% of each individual in the population every millisecond';
    }
}
      

function updateNumber(text,value,idp) {
    document.getElementById(idp).textContent = text + value;
}
function updateNumberPorcentaje(text,value,idp) {
    document.getElementById(idp).innerText = text + value + '%';
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
            
      }
      //agregar nuevo punto
      if(poblacionCopia[i].length <= 20 ){
        const pointX =  Math.floor(Math.random() * (imgElement.width - 0 + 1)) + 0;
        const pointY =  Math.floor(Math.random() * (imgElement.height - 0 + 1)) + 0;
        const p1 = new cv.Point(pointX, pointY);
        //console.log(p1)
        poblacionCopia[i].push(p1);
      }
      
      
    }
    return poblacionCopia
}



function mutation(poblation){
  
    const poblacionCopia = poblation.slice();
  
    for(let i = 0; i< poblation.length; i++){
  
      var numeroAleatorio = Math.floor(Math.random() * 100) + 1;
      if(numeroAleatorio<=PERCENTAGEINDIVIDUALMUTATE){
  
        //si un punto no esta en la linea modificarle la posicion
        for(let p = 0; p< poblacionCopia[i].length; p++){
    
          let punto = poblacionCopia[i][p];
          if(!validarCoordenada(punto.x,punto.y)){
            const pointX =  Math.floor(Math.random() * (imgElement.width - 0 + 1)) + 0;
            const pointY =  Math.floor(Math.random() * (imgElement.height - 0 + 1)) + 0;
            const p1 = new cv.Point(pointX, pointY);
            poblacionCopia[i][p] = p1;
          }
  
        }  
  
      }
      //agregar nuevo punto
      if(poblacionCopia[i].length <= 20 ){
        const pointX =  Math.floor(Math.random() * (imgElement.width - 0 + 1)) + 0;
        const pointY =  Math.floor(Math.random() * (imgElement.height - 0 + 1)) + 0;
        const p1 = new cv.Point(pointX, pointY);
        //console.log(p1)
        poblacionCopia[i].push(p1);
      }
      
      
    }
    return poblacionCopia
  }