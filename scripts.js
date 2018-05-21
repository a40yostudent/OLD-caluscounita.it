/*
 *  LINK IMPORTANTI:
 *  https://dev.socrata.com/
 *  https://www.dati.lombardia.it/Ambiente/Dati-sensori-aria/nicp-bhqi DATI SENSORI ARIA
 *  https://www.dati.lombardia.it/Ambiente/Stazioni-qualit-dell-aria/ib47-atvt STAZIONI QUALITA' ARIA
 */

'use strict';

let menuButton = document.getElementById('menu-button');
let navMenu = document.getElementsByTagName('nav')[0];

// MENU BUTTON AND NAV:
menuButton.addEventListener(
    'click',
    () => openMenu(menuButton, navMenu),
    false
);

function openMenu(button, menu) {
    if (!menu.getAttribute('style')) {
        button.children[0].classList.remove('fa-bars');
        button.children[0].classList.add('fa-chevron-up');

        menu.style.transform = 'translateY(0rem)';
    } else {
        button.children[0].classList.remove('fa-chevron-up');
        button.children[0].classList.add('fa-bars');

        menu.removeAttribute('style');
    }
}

// FETCH DATA FROM dati.lombardia.it

const ELENCO_SENSORI = [
    {
        id: 'PM10',
        description: 'Materia Particolata di diametro <= 10µm',
        operator: 'media giornaliera',
        units: 'µg/m³',
        query: {
            idsensore: 101827,
            idoperatore: 1,
            $order: 'data%20DESC'
        },
        readings: [] // { date: date, value: number }
    },
    {
        id: 'PM2.5',
        description: 'Materia Particolata di diametro <= 2.5µm',
        operator: 'media giornaliera',
        units: 'µg/m³',
        query: {
            idsensore: 105569,
            idoperatore: 1,
            $order: 'data%20DESC'
        },
        readings: [] // { date: date, value: number }
    },
    {
        id: 'NO2',
        description: 'Biossido di Azoto',
        operator: 'massimo giornaliero',
        units: 'µg/m³',
        query: {
            idsensore: 101825,
            idoperatore: 12,
            $order: 'data%20DESC'
        },
        readings: [] // { date: date, value: number }
    },
    {
        id: 'O3',
        description: 'Ozono',
        operator: 'massimo giornaliero',
        units: 'µg/m³',
        query: {
            idsensore: 101826,
            idoperatore: 12,
            $order: 'data%20DESC'
        },
        readings: [] // { date: date, value: number }
    },
    {
        id: 'O3',
        description: 'Ozono',
        operator: 'massima media mobile 8h',
        units: 'µg/m³',
        query: {
            idsensore: 101826,
            idoperatore: 11,
            $order: 'data%20DESC'
        },
        readings: [] // { date: date, value: number }
    }
];
const DATI_STIME_COMUNALI = 'https://www.dati.lombardia.it/resource/pfdd-9uzs.json';
// const ID_STAZIONE = '100558'; // non usato, gli id dei sensori sono già salvati.

const allDataRequests = [];

for (const sensor of ELENCO_SENSORI) {
    const query = sensor.query;
    let dataRequest = `${DATI_STIME_COMUNALI}?`;

    for (const key in query) {
        dataRequest += `${key}=${query[key]}&`;
    }

    allDataRequests.push(dataRequest);
}

let IQAvalue = 0;

for (const request of allDataRequests) {
    fetch(request)
        .then( response => response.json() )
        .catch( error => console.error('Error fetching data:', error) )
        .then( data => {
            ELENCO_SENSORI.forEach( item => {
                for (const element of data) {
                    if (element.idsensore == item.query.idsensore && element.idoperatore == item.query.idoperatore) {
                        const reading = {
                            date: element.data,
                            value: element.valore
                        };
                        item.readings.push( reading );
                    }
                }
            });
            return ELENCO_SENSORI;
        } )
        .then( elencoSensori => {

            elencoSensori.forEach( function(item) {
                switch (item.query.idsensore) {
                case 101827: // PM10
                    setHTMLby('PM10', 50);
                    break;
                case 105569: // PM 2.5
                    setHTMLby('PM25', 25);
                    break;
                case 101825: // Biossido di Azoto
                    setHTMLby('NO2', 200);
                    break;
                case 101826: // Ozono
                    if (item.query.idoperatore == 12) { // massimo giornaliero
                        setHTMLby('O3', 200);
                    } else if (item.query.idoperatore == 11) { // max media mobile 8h
                        setHTMLby('O3-8h', 120);
                    }
                    break;
                default:
                    break;
                }

                setTimeout(() => { // WHY IS NECESSARY TO TAKE TIME???
                    document.getElementById('IQA-val').innerHTML = setIQALabel(IQAvalue);
                    document.getElementById('IQA-val').style.backgroundColor = setColorBy(IQAvalue);
                }, 250);

                function setHTMLby(id, limit) {
                    setTimeout(() => { // WHY IS NECESSARY TO TAKE TIME???
                        document.getElementById(`${id}-rem`).innerHTML = item.readings[0].value;
                        document.getElementById(`${id}-val`).style.height = `${item.readings[0].value / limit * 4}` + 'em';
                        document.getElementById(`${id}-val`).style.backgroundColor =  setColorBy(item.readings[0].value / limit);
                        document.getElementById(`${id}-rem`).style.height = `${(limit - item.readings[0].value) / limit * 4}` + 'em';
                    }, 50);
                }

                function setIQALabel(value) {
                    switch (true) {
                    case (value == 0):
                        return 'Perfetta';
                    case (value > 0 && value <= 0.5):
                        return 'Buona';
                    case (value > 0.5 && value <= 1.0):
                        return 'Accettabile';
                    case (value > 1.0 && value <= 1.5):
                        return 'Media';
                    case (value > 1.5 && value <= 2.0):
                        return 'Pessima';
                    case (value > 2.0):
                        return 'Critica';
                    default:
                        return 'Non disponibile';
                    }
                }

                function setColorBy(value) {

                    if (value > IQAvalue) {
                        IQAvalue = value;
                    }

                    switch (true) {
                    case (value == 0):
                        return 'var(--perf)';
                    case (value > 0 && value <= 0.5):
                        return 'var(--good)';
                    case (value > 0.5 && value <= 1.0):
                        return 'var(--fair)';
                    case (value > 1.0 && value <= 1.5):
                        return 'var(--mean)';
                    case (value > 1.5 && value <= 2.0):
                        return 'var(--poor)';
                    case (value > 2.0):
                        return 'var(--bad)';
                    default:
                        return 'var(--undef)';
                    }
                }
            });
        });
}
