# Ölranker

Ranka öl


## Grejer att ha
Se till att du har `node`, `npm` och typ `nginx` 

Se till att du har öppnat upp port 80 för `nginx`

Skriv alla ölsorter i `data.txt` i `backend`

## Köra
Kör `npm i` och `build.sh` i `frontend`. Kopiera den `dist` du får 
till `nginx` och hosta på port 80 (ändra i nginx.conf)

Kör `npm i` och `node server2.js` i `backend`

Öppna upp `localhost`, du borde få fram två textrutor. Som kod skriver du 
`localhost`, och som namn skriver du `host`. Den här datorn ska sen visas 
för de andra deltagarna under rankningen, och de ska använda den kod som 
visas på den här datorn istället för `localhost`. 
