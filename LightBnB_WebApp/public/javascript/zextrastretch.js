
const checkImage = (url,id) => {
  let image = new Image();
  image.onload = function() { // image DOES exist
    if (this.width > 0) {
      let listid = "#listingid" + id;
    }
  };
  image.onerror = function() { // image does NOT exist
    let listid = "#listingid" + id;
    //alert("image doesn't exist:" + listid);
    $(listid).attr("src","./images/missingimage.png");
  };
  image.src = url;
};
// fail: checkImage("https://picsum.photos/200/300.dfsd");
// pass: checkImage("https://picsum.photos/200/300");