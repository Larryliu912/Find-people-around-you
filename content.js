  var access_token = window.location.hash.slice(14);     //slice 14 becuase the access_token started at 14th letter of url
  var aroundlist = [];
  var userstag = [];
  var usersfollow = [];                       
  var printedperson = [];                     //check the printedperson to aviod repeated person.

  navigator.geolocation.getCurrentPosition(showPosition)          
  function showPosition(position) {                 
    lat = position.coords.latitude              //define the location information for get around people and rthe page
    lng = position.coords.longitude
    getpeople()
  }

  $('#manual').submit(function(event) {        //as user submit the new location informaiton, remove old recommendation of people, and list new people.
    event.preventDefault();
    $('li').remove();
    $('.text').remove();
    $('.location').remove();
    manualposition()
  })

    function manualposition() {                      
      var postcode = $('#postcode').val();
      if (postcode==''){
          $('.positioninfo').append('<p class=location>We can not find the address or postcode you provided or you input a empty value, please try again.</p>')
    }
    else{
      $.ajax({
        type: 'GET',
        dataType: 'json',
        url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + postcode,
        success: function(response) {
          lat = response.results[0].geometry.location.lat;
          lng = response.results[0].geometry.location.lng;
          aroundlist.length = 0;                              //empty the old data variable or old data or they will be listed again
          userstag.length = 0;
          usersfollow.length = 0;
          printedperson.length = 0;
          getpeople()
        },
        error: function(xhr, status, error) {
          console.log(status);
          console.log(error);
        }
      });
    }
    }

  function callIndex() {                                 
    location.href = "Find_people_around_you.html";
  }

  function logout() {
    $('body').append('<div style="display:none"><img alt="img" src="https://instagram.com/accounts/logout" width="0" height="0"></div>') // for redirect, create a img
                                                                                                                //that can load the logout page
    setTimeout(callIndex, 1000)                     //callindex need to be run after logout page was loaded and account was logged out
  }


  function getpeople() {
    $.ajax({
      type: 'POST',
      data: 'json',
      url: 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&language=en',
      success: function(response) {
        console.log(response)
        $('.positioninfo').append('<p class=location>We found that the location you provided is around ' + response.results[0].formatted_address + ', if it is wrong or you want to find out persons on other area, you can input the postcode as well.</p>')

      },
      error: function(xhr, status, error) {
        console.log(status);
        console.log(error);
      }
    });


    $.ajax({
      type: "POST",
      dataType: 'jsonp',
      url: 'https://api.instagram.com/v1/media/search?lat=' + lat + '&lng=' + lng + '&client_id=1c09bb7f505641e9bb5921d41dbd8d79&distance=5000&count=n',
      success: function(response) {
        console.log(response)
        for (var i = 0; i < response.data.length; i++) {
          if (aroundlist.indexOf(response.data[i].user.id) == -1) {
            aroundlist.push(response.data[i].user.id);
          }
        }
        for (var i = 0; i < aroundlist.length; i++) {
          $.ajax({
            type: "POST",
            dataType: 'jsonp',
            url: 'https://api.instagram.com/v1/users/' + aroundlist[i] + '/media/recent/?client_id=1c09bb7f505641e9bb5921d41dbd8d79&count=n',
            success: function(response) {
              console.log(response)
              for (var n = 0; n < response.data.length; n++) {                                        //to look through the recent media of around people
                for (var m = 0; m < response.data[n].tags.length; m++) {
                    if (userstag.indexOf(response.data[n].tags[m]) && printedperson.indexOf(response.data[n].user.id) == -1) {  //indexof is used to check if the person has 
                                                                                                                                  //same tags as user or is repeated 
                      var $li = $('<li></li>')
                      var $nameurl = $('<a  class=namehref target=blank></a>')               //target for user look through the person conveniently 
                      $nameurl.attr('href', response.data[n].link)
                      var $name = $('<div class=name></div>')                     //all element was created in JavaScript 
                      var $dp = $('<img alt="img" class=dp>')
                      $dp.attr('src', response.data[0].user.profile_picture)
                      $name.append($dp)
                      $nameurl.append(response.data[n].user.username)
                      $name.append($nameurl)
                      $li.append($name)
                      var $img = $('<img alt="img" class=images>')
                      $img.attr('src', response.data[n].images.standard_resolution.url)
                      $li.append($img)
                      $li.append($)
                      var $text = $('<p class=text></p>')
                      $text.append(response.data[n].caption.text)
                      $li.append($text)
                      $li.appendTo('.Aroundperson')
                      printedperson.push(response.data[n].user.id)
                      console.log(response.data[n].user.username)
                    }
                  
                }
              }

            },
            error: function(xhr, status, error) {
              console.log(status);
              console.log(error);
            }
          });
        };

       function samefollowing(i) {                    // this part I use recursion function, because the foor loop run faster than ajax, when ajax gain the data, the i 
                                                      // always out of the data.length, it console.log nothing, this issue can be solve by recursion function.
            $.ajax({
              async: false,
              type: "POST",
              dataType: 'jsonp',
              url: 'https://api.instagram.com/v1/users/' + aroundlist[i] + '/follows?client_id=1c09bb7f505641e9bb5921d41dbd8d79',
              success: function(response) { 
                for (var n = 0; n < response.data.length; n++) {
                  if (usersfollow.indexOf(response.data[n].id) > -1 && printedperson.indexOf(aroundlist[i]) == -1) {
                    $.ajax({
                      type: "POST",
                      dataType: 'jsonp',
                      url: 'https://api.instagram.com/v1/users/' + aroundlist[i] + '/media/recent/?client_id=1c09bb7f505641e9bb5921d41dbd8d79&count=n',
                      success: function(response) {
                        console.log(response)
                        var $li = $('<li></li>')
                        var $name = $('<div class=name></div>')
                        var $dp = $('<img alt="img" class=dp>')
                        $dp.attr('src', response.data[0].user.profile_picture)
                        $name.append($dp)
                        var $nameurl = $('<a class=namehref></a>')
                        $nameurl.attr('href', response.data[0].link)
                        $nameurl.append(response.data[0].user.username)
                        $name.append($nameurl)
                        $li.append($name)
                        var $img = $('<img alt="img" class=images>')
                        $img.attr('src', response.data[0].images.standard_resolution.url)
                        $li.append($img)
                        var $text = $('<p class=text></p>')
                        if (response.data[0].caption != null) {
                          $text.append(response.data[0].caption.text)
                        } else {
                          $text.append()
                        }
                        $li.append($text)
                        $li.appendTo('.Aroundperson')
                        printedperson.push(response.data[0].user.id)
                      },
                      error: function(xhr, status, error) {
                        console.log(status);
                        console.log(error);
                      }
                    })


                  }
                }

              },
              error: function(xhr, status, error) {
                console.log(status);
                console.log(error);
              }
            });
            }

            for(var i=0;i < aroundlist.length;i++){
              samefollowing(i)

          }
        


      },
      error: function(xhr, status, error) {
        console.log(status);
        console.log(error);
      }
    });
    $.ajax({
      type: "POST",
      dataType: 'jsonp',
      url: 'https://api.instagram.com/v1/users/self/media/recent/?access_token=' + access_token,
      success: function(response) {
        for (i = 0; i < response.data.length; i++) {
          for (n = 0; n < response.data[i].tags.length; n++) {
            if (userstag.indexOf(response.data[i].tags[n]) == -1) {                    //for comparison tags between user's and around people's 
              userstag.push(response.data[i].tags[n])
            }
          }
        }
      },
      error: function(xhr, status, error) {
        console.log(status);
        console.log(error);
      }
    });

    $.ajax({
      type: 'POST',
      dataType: 'jsonp',
      url: 'https://api.instagram.com/v1/users/self/follows?access_token=' + access_token,
      success: function(response) {
        console.log(response)
        for (var i = 0; i < response.data.length; i++) {
          usersfollow.push(response.data[i].id)                                       //for comparison following between user's and around people's
        }
      },
      error: function(xhr, status, error) {
        console.log(status);
        console.log(error);
      }

    });

  }

