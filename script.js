var channelMarkup = "${type} <i>${id}</i><br>";
var repMarkup = "<br><b>${name}</b><br>${party}<br>";
var addressMarkup = "${line1}<br>${line2}<br>${city}<br>${state}, ${zip}<br>";
var phoneMarkup = "<br>P:${phones}<br>";
var officeMarkup = "<br><br><b>${title}</b><br>${levels}<br>${roles}<br>";
var photoMarkup = "<br><img src='${photo}' width='20%' height='20%'>";

function checkLevelsInArray() {         
  var allLevels = [];
  $('#levelFilter :checked').each(function() {
    allLevels.push($(this).val());
  });
  return allLevels;
}

function checkRolesInArray() {         
  var allRoles = [];
  $('#roleFilter :checked').each(function(){
    allRoles.push($(this).val());
  });
  return allRoles;
}

function checkFilters(criteriaArray, repArray){
  var filtered = [];
  console.log(criteriaArray);
  console.log(repArray);
  //for each rep object, check against roles and levels
  for(var i in repArray){
    for(var j in criteriaArray){
      console.log(criteriaArray[j]);
      if(repArray[i].office!=null && repArray[i].office.indexOf(criteriaArray[j])>-1){
        console.log("hello");
        filtered.push(repArray[i]);

      }
    }
  }
  console.log(filtered);
  return filtered;
}

function displayRep(rep, includeOffices){

  console.log(includeOffices);
  $("<div class='aligncenter' style='width:400px;height:0;border-top:2px dotted #880088;font-size:0;'>-</div>").appendTo("#results");

  //display each official and the office related to the entered address
  if(rep.photo!=null){
    $.template("photoTemplate", photoMarkup);
    $.tmpl("photoTemplate", rep).appendTo("#results");
  }
  $.template("repTemplate", repMarkup);
  
  if(includeOffices==true){
    $.template("officeTemplate", officeMarkup);
    $.tmpl("officeTemplate",rep).appendTo("#results");
  }

  $.tmpl("repTemplate",rep).appendTo("#results");

  if(rep.address!=null){
  $.template("addressTemplate", addressMarkup);
  $.tmpl("addressTemplate", rep.address).appendTo("#results");
  }
  if(rep.phones!=null){
    $.template("phoneTemplate", phoneMarkup);
    $.tmpl("phoneTemplate", rep).appendTo("#results");
  }
  //iterate through the channels
  $("<br>").appendTo("#results");
  for(var num in rep.channels){
    $.template("channelTemplate", channelMarkup);
    $.tmpl("channelTemplate", rep.channels[num]).appendTo("#results");
  }
}

function makeObjects(results, officeIndices){

  var reps = [];
  for (var x in officeIndices){
    var index = officeIndices[x];
    //make a new rep object
    var rep = new Object();

    rep.title = results.offices[index].name;                        //string
    if(results.offices[index].roles){
      rep.roles = results.offices[index].roles;                     //array
      rep.levels = results.offices[index].levels;                   //array
      rep.office = (rep.roles).concat(rep.levels);
    }

    //go to officialIndices and add the index into array
    var officialIndices = results.offices[index].officialIndices;        
    for(var y in officialIndices){ 
      var oIndex = officialIndices[y];
      //go to officials and take information from those officials at the officialIndices positions
      if(results.officials[oIndex].address){
        rep.address = results.officials[oIndex].address;          //array
      }
      rep.name = results.officials[oIndex].name;                  //string
      rep.party = results.officials[oIndex].party;                //string
      if(results.officials[oIndex].photoUrl){
        rep.photo = results.officials[oIndex].photoUrl;
        console.log(rep.photo);
      }
      if(results.officials[oIndex].phones){
        rep.phones = results.officials[oIndex].phones;            //array
      }
      if(results.officials[oIndex].channels){
        rep.channels = results.officials[oIndex].channels;        //array
      }

      //put rep object into the reps array
      reps.push(rep);
      console.log(rep);

    }
  }
  return reps;
}

function lookup(address, includeOffices){
  var req =  new XMLHttpRequest();
  var addr = "address=".concat(document.getElementById("address").value);
  var url = "https://www.googleapis.com/civicinfo/v2/representatives?".concat([addr,"&key=AIzaSyBs3-wBKHCwUYoHt2VmiLLRlDfHdr86v20"]);


  req.onreadystatechange = function(){
    if(req.readyState == 4){
      if(req.status == 200){
        $("#results").empty();
        var results = JSON.parse(req.responseText);
        //puts the division names into an ordered array
        var division_array = Object.keys(results.divisions);
        division_array.sort();
        var div_len = division_array.length;
        console.log(division_array);
        var district_name = division_array[div_len-1];
        var county_name = division_array[div_len-2];
        if(div_len==5){
          var place_name = division_array[div_len-3];
          county_name.concat(place_name);
        }

        console.log(district_name);
        console.log(county_name);
        //collect the relevant indices for county and district offices
        var officeIndices = (results.divisions[district_name].officeIndices).concat(results.divisions[county_name].officeIndices);
        //picks out the offices of from the officeIndices position
        //for each relevant office index, we create a new object that will go into the rep array
        var reps = makeObjects(results, officeIndices, levels, roles);
        console.log(reps);
        var levels = checkLevelsInArray();
        var roles = checkRolesInArray();
        var len = levels.concat(roles).length;
        //if no filters were applied
        if(len==0){
          $("<h4>Please find the results to your search below:</h4><br>").appendTo("#results");
          for(i in reps)
            displayRep(reps[i], includeOffices);
        }
        else{
          //for results that need a filter to be applied
          var filtered = [];
          filtered = checkFilters(levels.concat(roles), reps);
          if(filtered!=null){
            $("<h4>Please find the results to your search below:</h4><br>").appendTo("#results");
            for(var i in filtered){
              displayRep(filtered[i], includeOffices);
            }
          }
          else
            window.alert("Results matching your criteria were not found. Please try applying other criteria.");
        }
      }
      else 
        window.alert("Please enter a valid zip code");
    }
  }
  req.open("GET",url, true);
  req.send(null);
}

function main(address, includeOffices){
  console.log(address);
  lookup(address, includeOffices);

}
