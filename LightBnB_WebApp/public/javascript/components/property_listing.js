$(() => {
  window.propertyListing = {};
  

  function createListing(property, isReservation, pCount) {
    // error check for broken images via bad url or missing image at url
    checkImage(property.thumbnail_photo_url, property.id);
    
    let timeOut = Math.floor(Math.random() * (1400 - 30 + 1)) + 30; // misc numbers for randomizing some time
    // get geo coordinates for city, province, then place map markers - do it with 'style': staggering the marker drops
    setTimeout(() => {
      getGeo(property.city,property.province);
    }, timeOut);

    let revealClass;
    pCount > 1 ? revealClass="reveal" : revealClass="";

    // process star rating
    const fullStar =  `<i class="fa-solid fa-star"></i>`;
    const halfStar =  `<i class="fa-solid fa-star-half-stroke"></i>`;
    const emptyStar = `<i class="fa-regular fa-star"></i>`;
    let finalStars = '';
    let theRating = Math.round(property.average_rating * 100) / 100;
    let decimal = Math.trunc(theRating);
    let starCounter = 0;
    for (starCounter = 0; starCounter < decimal; starCounter ++) {
      finalStars += fullStar;
    }
    if (theRating - decimal > .8) {
      // rounded up
      finalStars += fullStar;
      starCounter ++;
    } else if (theRating - decimal < 0.2) {
      // rounded down (do nothing)
    } else {
      // half star
      finalStars += halfStar;
      starCounter ++;
    }
    let moreStars = 5 - starCounter;
    for(let x = 0; x < moreStars; x ++) {
      finalStars += emptyStar;
    }

    // ORIGINAL code to replace ${finalStars}
    let actualRating = Math.round(property.average_rating * 100) / 100; // out of 5
    let toolTipRating = "Exact rating: " + actualRating + " / 5.";
    return `
    <div class="property-container ${revealClass}">
    <article class="property-listing">
        <section class="property-listing__preview-image">
          <img src="${property.thumbnail_photo_url}" alt="house" class="imgthumb" id="listingid${property.id}">
        </section>
        <section class="property-listing__details">
          <h3 class="property-listing__title">${property.title}</h3>
          
            ${property.street},<br>
            ${property.city}, ${property.province}
          
          <p>${isReservation ? 
            `booked: ${moment(property.start_date).format('ll')} - ${moment(property.end_date).format('ll')}` 
            : ``}&nbsp;</p>
          <footer class="property-listing__footer">
            <div class="property-listing__rating tooltip expand stars" data-title="${toolTipRating}">${finalStars}</div>
            <div class="property-listing__price">$${property.cost_per_night/100.0}/night</div>
          </footer>
        </section>
      </article>
        <div class="property-listing-overlay">
        <table border=0 width=180><tr>
        <td width=50%>
        <ul class="property-listing__details">
        <big><BR><B>
        ${property.number_of_bedrooms}&nbsp;<i class="fa-solid fa-bed"></i><BR><BR>
        ${property.number_of_bathrooms}&nbsp;<i class="fa-solid fa-bath"></i><BR><BR>
        ${property.parking_spaces}&nbsp;<i class="fa-solid fa-car-side"></i>
        </B></big>
        </ul>
        </td>
        <td align=center>
        <i class="fa-solid fa-house fa-xl" style="color:#505050ff"></i>
        </td>
        </tr></table>
        </div>
      </div>
    `
  }

  window.propertyListing.createListing = createListing;

});


//
// implement mapping
// 1. get lat long,
// 2. plot map markers
//

//
// google maps API for fetching location (lat/lng) is expensive, let's save costs and make API calls only when necessary
// internal db structure is city: { lat: xx, lng: xx}



//
// get lat long of city
// -- NOTE check local database before using API - if we've fetch from API, add info into internal DB so we don't have to fetch again.
// google API is $0.005 per request for lat/long info
const geoLocationDb = {

  "Spruce Grove": {
    "lat": 53.5412414,
    "lng": -113.9100733
},
"Strathmore": {
    "lat": 51.037741,
    "lng": -113.4003335
},
"Saint Stephen": {
    "lat": 45.1941651,
    "lng": -67.2755622
},
"Winnipeg": {
    "lat": 49.8954221,
    "lng": -97.1385145
},
"Wilmot": {
    "lat": 43.4064939,
    "lng": -80.6505227
},
"Sotboske": {
    "lat": 46.8130816,
    "lng": -71.20745959999999
},
"Yellowknife": {
    "lat": 62.4539717,
    "lng": -114.3717886
},
"Thetford Mines": {
    "lat": 46.1028329,
    "lng": -71.3055522
},
"Stonewall": {
    "lat": 50.1347241,
    "lng": -97.32663289999999
},
"Swan Hills": {
    "lat": 54.7166671,
    "lng": -115.4027753
},
"Tumbler": {
    "lat": 55.125795,
    "lng": -120.993154
},
"Craik": {
    "lat": 51.0520945,
    "lng": -105.8224018
},
"Charlottetown": {
    "lat": 46.23824,
    "lng": -63.13107040000001
},
"Weyburn": {
    "lat": 49.6632836,
    "lng": -103.8532906
},
"Esterhazy": {
    "lat": 50.6568523,
    "lng": -102.0757792
},
"St. Johns": {
    "lat": 47.5615096,
    "lng": -52.7125768
},
"Swan River": {
    "lat": 52.1063497,
    "lng": -101.2631488
},
"Wynyard": {
    "lat": 51.7652302,
    "lng": -104.1792004
},
"Carcross": {
    "lat": 60.1675851,
    "lng": -134.7073506
},
"Georgina": {
    "lat": 44.296296,
    "lng": -79.43623199999999
},
"Windsor": {
    "lat": 42.3149367,
    "lng": -83.03636329999999
},
"Victoria": {
    "lat": 48.4284207,
    "lng": -123.3656444
},
"Medicine Hat": {
    "lat": 50.0290218,
    "lng": -110.7031976
},
"Grande Prairie": {
    "lat": 55.170691,
    "lng": -118.7884808
},
"Burlington": {
    "lat": 43.3255196,
    "lng": -79.7990319
},
"Olds": {
    "lat": 51.7950595,
    "lng": -114.1199063
},
"Oakville": {
    "lat": 43.467517,
    "lng": -79.6876659
},
"Cobourg": {
    "lat": 43.9593373,
    "lng": -78.1677363
},
"calgary": {
    "lat": 51.04473309999999,
    "lng": -114.0718831
},
"Ajax": {
    "lat": 43.8508553,
    "lng": -79.0203732
},
"Newmarket": {
    "lat": 44.05918700000001,
    "lng": -79.46125599999999
},
"Timmins": {
    "lat": 48.4758208,
    "lng": -81.3304953
},
"Yarmouth": {
    "lat": 43.8378563,
    "lng": -66.1197201
},
"Paradise": {
    "lat": 47.5306597,
    "lng": -52.8873992
},
"Taber": {
    "lat": 49.7818493,
    "lng": -112.1496791
},
"Vancouver": {
    "lat": 49.2827291,
    "lng": -123.1207375
},
"Haldimand-Norfork": {
    "lat": 51.253775,
    "lng": -85.3232139
},
"Mount Royal": {
    "lat": 45.5125819,
    "lng": -73.6468307
},
"Quebec": {
    "lat": 46.8130816,
    "lng": -71.20745959999999
},
"Aylmer": {
    "lat": 45.3945087,
    "lng": -75.84396029999999
},
"Grand Falls": {
    "lat": 47.0479934,
    "lng": -67.7399015
},
"Markham": {
    "lat": 43.8561002,
    "lng": -79.3370188
},
"McLennan": {
    "lat": 55.7115504,
    "lng": -116.9043009
},
"Victoriaville": {
    "lat": 46.0556724,
    "lng": -71.95895589999999
},
"Kincardine": {
    "lat": 44.1752954,
    "lng": -81.6365715
},
"Castlegar": {
    "lat": 49.3237408,
    "lng": -117.6593341
},
"Breton": {
    "lat": 53.110032,
    "lng": -114.4719526
},
"Brosssard": {
    "lat": 45.4514357,
    "lng": -73.4619103
},
"Saint-Leonard": {
    "lat": 45.5832162,
    "lng": -73.5807147
},
"Thorold": {
    "lat": 43.1236091,
    "lng": -79.1989299
},
"North Vancouver": {
    "lat": 49.3199816,
    "lng": -123.0724139
},
"Colonsay": {
    "lat": 51.9770121,
    "lng": -105.8744599
},
"Miramichi": {
    "lat": 47.0295709,
    "lng": -65.50590609999999
},
"Bohbatev": {
    "lat": 53.9332706,
    "lng": -116.5765035
},
"Halton Hills": {
    "lat": 43.646987,
    "lng": -80.017663
},
"Hanna": {
    "lat": 51.6442555,
    "lng": -111.9258289
},
"Chesterville": {
    "lat": 45.10229409999999,
    "lng": -75.2287886
},
"Quinte West": {
    "lat": 44.1018879,
    "lng": -77.5754056
},
"Beauport": {
    "lat": 46.8744418,
    "lng": -71.1967475
},
"Chicoutimi": {
    "lat": 48.4120843,
    "lng": -71.05110789999999
},
"Regina": {
    "lat": 50.4452112,
    "lng": -104.6188944
},
"Camrose": {
    "lat": 53.0173444,
    "lng": -112.8251176
},
"Lennoxville": {
    "lat": 45.3662778,
    "lng": -71.8565469
},
"Sylvan Lake": {
    "lat": 52.3065751,
    "lng": -114.09728
},
"Saanich": {
    "lat": 48.4527784,
    "lng": -123.3754551
},
"Goulbourn": {
    "lat": 45.2350001,
    "lng": -75.9040346
},
"Amos": {
    "lat": 48.5650196,
    "lng": -78.1125205
},
"Parrsboro": {
    "lat": 45.4056589,
    "lng": -64.32588740000001
},
"Strathcona County": {
    "lat": 53.53267760000001,
    "lng": -113.1553199
},
"Baddeck": {
    "lat": 46.0999169,
    "lng": -60.754676
},
"Maple Ridge": {
    "lat": 49.2193226,
    "lng": -122.598398
},
"Bonnyville": {
    "lat": 54.2679661,
    "lng": -110.7397826
},
"Alma": {
    "lat": 48.5504607,
    "lng": -71.6527704
},
"Melfort": {
    "lat": 52.8608387,
    "lng": -104.6142973
},
"Penticton": {
    "lat": 49.4991381,
    "lng": -119.5937077
},
"Yorkton": {
    "lat": 51.2174482,
    "lng": -102.4739331
},
"Sooke": {
    "lat": 48.37403459999999,
    "lng": -123.7355539
},
"Terrace": {
    "lat": 54.5181925,
    "lng": -128.603154
},
"Lindsay": {
    "lat": 44.3565742,
    "lng": -78.7407542
},
"Laval": {
    "lat": 45.6066487,
    "lng": -73.712409
},
"Cranberry Portage": {
    "lat": 54.5856218,
    "lng": -101.3762873
},
"Botwood": {
    "lat": 49.1422983,
    "lng": -55.3440853
},
"Wasaga Beach": {
    "lat": 44.5207419,
    "lng": -80.01606679999999
},
"Portaux Basques": {
    "lat": 47.5721149,
    "lng": -59.136429
},
"Coaticook": {
    "lat": 45.1325529,
    "lng": -71.80318849999999
},
"Labrador City": {
    "lat": 52.9390014,
    "lng": -66.914216
},
"Chilliwack": {
    "lat": 49.1579401,
    "lng": -121.9514666
},
"Snow Lake": {
    "lat": 54.8566371,
    "lng": -99.95200369999999
},
"Montreal-Est": {
    "lat": 45.6320003,
    "lng": -73.5066981
},
"North Cowichan": {
    "lat": 48.81418,
    "lng": -123.736086
},
"Temagami": {
    "lat": 47.0633734,
    "lng": -79.7895671
},
"Oromocto": {
    "lat": 45.8486646,
    "lng": -66.481286
},
"Summerside": {
    "lat": 46.39337769999999,
    "lng": -63.79023309999999
},
"Town of Inuvik": {
    "lat": 68.3607437,
    "lng": -133.7230177
},
"Amherst": {
    "lat": 45.83443949999999,
    "lng": -64.21233939999999
},
"Inverness County": {
    "lat": 46.1793911,
    "lng": -61.2038641
},
"Queens": {
    "lat": 44.2372313,
    "lng": -64.98002079999999
},
"Surrey": {
    "lat": 49.1913466,
    "lng": -122.8490125
},
"Beaumont": {
    "lat": 53.3521108,
    "lng": -113.415127
},
"Niagara-on-the-Lake": {
    "lat": 43.2549988,
    "lng": -79.0772616
},
"Lethbridge": {
    "lat": 49.6956181,
    "lng": -112.8451067
},
"Town of Hay River": {
    "lat": 60.816218,
    "lng": -115.7853653
},
"Halifax": {
    "lat": 44.8857087,
    "lng": -63.1005273
},
"Merritt": {
    "lat": 50.1113079,
    "lng": -120.7862222
},
"New Westminster": {
    "lat": 49.2057179,
    "lng": -122.910956
},
"The Pas": {
    "lat": 53.8254947,
    "lng": -101.2427087
},
"Mission": {
    "lat": 49.1329272,
    "lng": -122.3261603
},
"Chateauguay": {
    "lat": 45.36015889999999,
    "lng": -73.74940330000001
},
"Fernie": {
    "lat": 49.50404520000001,
    "lng": -115.063065
},
"Cumberland": {
    "lat": 45.51713360000001,
    "lng": -75.4060294
},
"Sorel": {
    "lat": 46.042825,
    "lng": -73.112302
},
"Norwich": {
    "lat": 42.9876575,
    "lng": -80.5974658
},
"Turner Valley": {
    "lat": 50.6738515,
    "lng": -114.2788239
},
"City of Port Moody": {
    "lat": 49.2849107,
    "lng": -122.8677562
},
"Brazeau": {
    "lat": 52.470291,
    "lng": -116.073898
},
"Steinbach": {
    "lat": 49.5303097,
    "lng": -96.69120509999999
},
"Port Bruce": {
    "lat": 42.654511,
    "lng": -81.008881
},
"Coquitlam": {
    "lat": 49.2837626,
    "lng": -122.7932065
},
"Cap-Pele": {
    "lat": 46.21521860000001,
    "lng": -64.2705411
},
"Port Elgin": {
    "lat": 46.0496462,
    "lng": -64.0878206
},
"Sarnia": {
    "lat": 42.974536,
    "lng": -82.4065901
},
"Montague": {
    "lat": 46.1650664,
    "lng": -62.6480207
},
"Prince Rupert": {
    "lat": 54.3150367,
    "lng": -130.3208187
},
"Lunenburg County": {
    "lat": 44.5441625,
    "lng": -64.4797871
},
"Lincoln": {
    "lat": 43.139227,
    "lng": -79.48490000000001
},
"Jonquiere": {
    "lat": 48.4117537,
    "lng": -71.255071
},
"Atikokan": {
    "lat": 48.7575098,
    "lng": -91.6218292
},
"Calgary": {
    "lat": 51.04473309999999,
    "lng": -114.0718831
},
"Kamloops": {
    "lat": 50.674522,
    "lng": -120.3272674
},
"Kingston": {
    "lat": 44.2311717,
    "lng": -76.4859544
},
"Prince Albert": {
    "lat": 53.2033494,
    "lng": -105.7530705
},
"Larder Lake": {
    "lat": 48.0977297,
    "lng": -79.7152076
},
"Anjou": {
    "lat": 45.6123514,
    "lng": -73.5553259
},
"Drummondville": {
    "lat": 45.8802909,
    "lng": -72.4842824
},
"Ottawa": {
    "lat": 45.4215296,
    "lng": -75.69719309999999
},
"Drayton Valley": {
    "lat": 53.2214945,
    "lng": -114.976746
},
"Hinton": {
    "lat": 53.399067,
    "lng": -117.5794057
},
"Bridgewater": {
    "lat": 44.3795966,
    "lng": -64.5213299
},
"Irricana": {
    "lat": 51.321685,
    "lng": -113.6038872
},
"Hamilton": {
    "lat": 43.2557206,
    "lng": -79.8711024
},
"Vaughan": {
    "lat": 43.8563158,
    "lng": -79.5085383
},
"Saskatoon": {
    "lat": 52.157902,
    "lng": -106.6701577
},
"LaSalle": {
    "lat": 45.4306303,
    "lng": -73.6348608
},
"Whitehorse": {
    "lat": 60.7197137,
    "lng": -135.0522761
},
"Edmonton": {
    "lat": 53.5460983,
    "lng": -113.4937266
},
"Marieville": {
    "lat": 45.4326294,
    "lng": -73.1602036
},
"Vermillion": {
    "lat": 53.3539325,
    "lng": -110.8586098
},
"East Zorra-Tavistock": {
    "lat": 43.2358071,
    "lng": -80.8138705
},
"Souris": {
    "lat": 46.3549799,
    "lng": -62.2518341
},
"Fleurimont": {
    "lat": 45.4079914,
    "lng": -71.8706169
},
"Alberton": {
    "lat": 46.8131294,
    "lng": -64.0648274
},
"Lumby": {
    "lat": 50.250699,
    "lng": -118.967831
},
"Ingersoll": {
    "lat": 43.03816279999999,
    "lng": -80.88404899999999
},
"Lasalle": {
    "lat": 45.4306303,
    "lng": -73.6348608
},
"North Bay": {
    "lat": 46.3091152,
    "lng": -79.4608204
},
"Delta": {
    "lat": 49.09521549999999,
    "lng": -123.0264759
},
"Shippagan": {
    "lat": 47.74392839999999,
    "lng": -64.7056928
},
"Truro": {
    "lat": 45.36462239999999,
    "lng": -63.27650609999999
},
"Fort Erie": {
    "lat": 42.9017764,
    "lng": -78.9721745
},
"Mahone Bay": {
    "lat": 44.4492264,
    "lng": -64.3822793
},
"Memramcook": {
    "lat": 46.0044309,
    "lng": -64.5513093
},
"Unity": {
    "lat": 52.44373239999999,
    "lng": -109.1583194
},
"Brockville": {
    "lat": 44.5895244,
    "lng": -75.68428580000001
},
"Cornwall": {
    "lat": 46.2294978,
    "lng": -63.21699109999999
},
"Kaslo": {
    "lat": 49.91424989999999,
    "lng": -116.9154503
},
"Brandon": {
    "lat": 49.8437486,
    "lng": -99.95148069999999
},
"Annapolis": {
    "lat": 44.7439614,
    "lng": -65.5196358
},
"Hants County": {
    "lat": 45.08919059999999,
    "lng": -63.9170688
},
"Elgin": {
    "lat": 42.6645873,
    "lng": -80.9871074
},
"Lunenburg": {
    "lat": 44.3769777,
    "lng": -64.3110901
},
"Parksville": {
    "lat": 49.3193375,
    "lng": -124.3136412
},
"Corner Brook": {
    "lat": 48.9489967,
    "lng": -57.95027260000001
},
"Langley": {
    "lat": 49.1041779,
    "lng": -122.6603519
},
"Sackville": {
    "lat": 45.897903,
    "lng": -64.3682803
},
"Sparwood": {
    "lat": 49.7308665,
    "lng": -114.8861593
},
"Osoyoos": {
    "lat": 49.032304,
    "lng": -119.468163
},
"Chemainus": {
    "lat": 48.9301648,
    "lng": -123.7344814
},
"Provost": {
    "lat": 52.3557149,
    "lng": -110.2603858
},
"Saint John": {
    "lat": 45.2733153,
    "lng": -66.0633081
},
"Ft. Saskatchewan": {
    "lat": 53.6962239,
    "lng": -113.2163654
},
"Shell Lake": {
    "lat": 53.3061965,
    "lng": -107.0623377
},
"East Hants": {
    "lat": 45.0389258,
    "lng": -63.71263150000001
},
"Sussex": {
    "lat": 45.72361919999999,
    "lng": -65.5108761
},
"Joliette": {
    "lat": 46.014012,
    "lng": -73.41779609999999
},
"Chester": {
    "lat": 44.5421155,
    "lng": -64.2388802
},
"Didzbury": {
    "lat": 51.6568097,
    "lng": -114.1367837
},
"Flin Flon": {
    "lat": 54.77513889999999,
    "lng": -101.8493669
},
"Bishops Falls": {
    "lat": 49.0138869,
    "lng": -55.487801
},
"Hull": {
    "lat": 45.428731,
    "lng": -75.71336579999999
},
"Eastend": {
    "lat": 49.514043,
    "lng": -108.8199661
},
"Peace River": {
    "lat": 57.53526290546927,
    "lng": -116.8175588190212
},
"Fredericton": {
    "lat": 45.9635895,
    "lng": -66.6431151
},
"Richmond": {
    "lat": 49.1665898,
    "lng": -123.133569
},
"Pictou County": {
    "lat": 45.5321115,
    "lng": -62.63251210000001
},
"Nepean": {
    "lat": 45.33490459999999,
    "lng": -75.7241006
},
"Leamington": {
    "lat": 42.0531634,
    "lng": -82.5998874
},
"Dymond": {
    "lat": 47.5407609,
    "lng": -79.6702865
},
"Gravelbourg": {
    "lat": 49.8756758,
    "lng": -106.5573172
},
"Gatineau": {
    "lat": 45.4765446,
    "lng": -75.7012723
},
"Owen Sound": {
    "lat": 44.5690305,
    "lng": -80.9405602
},
"Cape Breton": {
    "lat": 46.2486851,
    "lng": -60.851817
},
"Durham": {
    "lat": 44.1763254,
    "lng": -80.8185006
},
"Wood Buffalo": {
    "lat": 57.6066083,
    "lng": -111.6495855
},
"Birtle": {
    "lat": 50.4221254,
    "lng": -101.0449519
},
"Swift Current": {
    "lat": 50.285069,
    "lng": -107.7971722
},
"Avonlea": {
    "lat": 50.0157533,
    "lng": -105.0548738
},
"St. Albert": {
    "lat": 53.6539037,
    "lng": -113.6292701
},
"Vernon": {
    "lat": 50.2670137,
    "lng": -119.2720107
},
"Tisdale": {
    "lat": 52.8473958,
    "lng": -104.0489835
},
"Invermere": {
    "lat": 50.5064562,
    "lng": -116.0291433
},
"Peterborough": {
    "lat": 44.3047061,
    "lng": -78.3199606
},
"Wainfleet": {
    "lat": 42.923366,
    "lng": -79.3757559
},
"Tracadie-Sheila": {
    "lat": 47.512071,
    "lng": -64.912087
},
"Moncton": {
    "lat": 46.0878165,
    "lng": -64.7782313
},
"Genwenzuj": {
    "lat": 53.1355091,
    "lng": -57.6604364
},
"Stratford": {
    "lat": 46.215926,
    "lng": -63.08860989999999
},
"Kentville": {
    "lat": 45.0771182,
    "lng": -64.49428259999999
},
"Cranbrook": {
    "lat": 49.5129678,
    "lng": -115.7694002
},
"Cache Creek": {
    "lat": 50.8108099,
    "lng": -121.3233237
},
"Stellarton": {
    "lat": 45.5568366,
    "lng": -62.66033969999999
},
"Nanaimo": {
    "lat": 49.1658836,
    "lng": -123.9400647
},
"Shelburne": {
    "lat": 43.76328549999999,
    "lng": -65.32351680000001
},
"Argyle": {
    "lat": 43.79365,
    "lng": -65.855
},
"Thompson": {
    "lat": 55.7451003,
    "lng": -97.8509232
},
"New Glasgow": {
    "lat": 45.58719929999999,
    "lng": -62.6451868
},
"Port Hardy": {
    "lat": 50.7207083,
    "lng": -127.4968729
},
"Huntsville": {
    "lat": 45.3269323,
    "lng": -79.2167539
},
"Sherbrooke": {
    "lat": 45.4042669,
    "lng": -71.89367399999999
},
"County of Kings": {
    "lat": 44.9289893,
    "lng": -64.574615
},
"Dauphin": {
    "lat": 51.1496809,
    "lng": -100.0499383
},
"Airdrie": {
    "lat": 51.29269679999999,
    "lng": -114.0134113
},
"Montreal": {
    "lat": 45.5018869,
    "lng": -73.56739189999999
},
"Lacombe": {
    "lat": 52.4681872,
    "lng": -113.730525
},
"Orillia": {
    "lat": 44.6082465,
    "lng": -79.4196783
},
"Creighton": {
    "lat": 54.75399,
    "lng": -101.898019
},
"Whistler": {
    "lat": 50.11616859999999,
    "lng": -122.9535117
},
"Thunder Bay": {
    "lat": 48.3808951,
    "lng": -89.2476823
},
"Whitby": {
    "lat": 43.8975446,
    "lng": -78.94293290000002
},
"Brantford": {
    "lat": 43.1393867,
    "lng": -80.2644254
},
"Leduc": {
    "lat": 53.2647566,
    "lng": -113.5525216
},
"Kirkland Lake": {
    "lat": 48.1497173,
    "lng": -80.031517
},
"Levis": {
    "lat": 46.7582576,
    "lng": -71.2397151
},
"Woolwich": {
    "lat": 43.5396162,
    "lng": -80.5535125
},
"Nipawin": {
    "lat": 53.3623525,
    "lng": -104.0130053
},
"Mount Pearl": {
    "lat": 47.52064070000001,
    "lng": -52.8076818
},
"Belleville": {
    "lat": 44.1627589,
    "lng": -77.3832315
},
"Dorval": {
    "lat": 45.4503213,
    "lng": -73.75004849999999
},
"Pictou": {
    "lat": 45.6761282,
    "lng": -62.70884499999999
},
"Argentia": {
    "lat": 47.302052,
    "lng": -53.986824
},
"Grand Bay-Westfield": {
    "lat": 45.3614925,
    "lng": -66.2416978
},
"Colwood": {
    "lat": 48.4287565,
    "lng": -123.4888932
},
"New Minas": {
    "lat": 45.0723417,
    "lng": -64.4457453
},
"Port Alberni": {
    "lat": 49.2338882,
    "lng": -124.8055494
},
"Brigus": {
    "lat": 47.5332661,
    "lng": -53.2205795
},
"Cumberland County": {
    "lat": 45.7605553,
    "lng": -64.02754449999999
},
};
const getGeo = (city,prov) => {
  const apiKey = 'AIzaSyCfRtVUE5xGwJE6CABUHU7P_IZsWdgoK_k';
  const apiURL = `https://maps.googleapis.com/maps/api/geocode/json?key=${apiKey}&address=${city},${prov}&sensor=false`;
  // check internal database FIRST and if not found, only then fetch via API (each request is $0.005)
  if(geoLocationDb[city] !== undefined) {
    console.log("GEO from internal DB");
    placeMarker({lat:geoLocationDb[city].lat,lng:geoLocationDb[city].lng},city,prov);
  } else {
    alert("GEO not in internal db - google fetch");
    fetch(apiURL).then(function (response) {
      // The API call was successful!
      return response.json();
    }).then(function (data) {
      // This is the OBJECT from our response
      let tempEntry = {lat: data.results[0].geometry.location.lat, lng: data.results[0].geometry.location.lng,};
      geoLocationDb[city] = tempEntry;
      placeMarker({lat:data.results[0].geometry.location.lat,lng:data.results[0].geometry.location.lng},city,prov);
    }).catch(function (err) {
      console.warn('GEOCODE: Something went wrong.', err);
    });
    return;
  }
};