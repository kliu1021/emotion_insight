"use strict";

/* SOME CONSTANTS */
const endpoint01 = "https://7l2mpgfhol.execute-api.us-east-1.amazonaws.com/default/project5_liu_bortz";


const apiEndpoint = 'https://api-us.faceplusplus.com/facepp/v3/detect';
const apiKey = 'API_KEY'; // Replace with the actual API key
const apiSecret = 'API_KEY'; // Replace with the actual API key

const tts_api = 'https://api.openai.com/v1/audio/speech';

const imagechart_api = "https://image-charts.com/chart?";


var traits;
var emo_audio;
var face_num;

/* SUPPORTING FUNCTIONS */
let clearFormController = () => {
    $('#div-userform').hide();
    $('#btn-adduser').show();
    $("#adduser-firstname").val("");
    $("#adduser-lastname").val("");
}

let scan_history = (userID) => {

    $.ajax({
        "url": endpoint01 + "/scan",
        "data": "&user_id=" + userID,
        "method": "GET",
        "success": (results) => {
            $('#scan_time_message').html("");
            $("#scan_time_message").removeClass();
            $('#scan_time').html('');

            console.log(results);

            let scan_his = "<table>";
            scan_his += "<tr><th>" + "Emotion" + "</th>";
            scan_his += "<th>" + "Date Scanned" + "</th>";
            scan_his += "<th>" + "Time Scanned" + "</th></tr>";

            for (let i = 0; i < results.length; i++) {
                let date_time = (results[i]["datetime"]).split('T');
                let date = date_time[0]
                let time = date_time[1].slice(0, 8);
                scan_his += "<tr>";
                scan_his += "<td>" + results[i]["emotion"] + "</td>";
                scan_his += "<td>" + date + "</td>";
                scan_his += "<td>" + time + "</td>";
                scan_his += "</tr>";
            }
            scan_his += "</table>";
            $('#scan_time').html(scan_his);
        },
        "error": (data) => {
            console.log(data);
            $('#scan_time_message').html('An error has occurred showing the scan history. Please refresh the page!');
            $('#scan_time_message').addClass('alert alert-danger text-center');

        }
    })
}


let plotPieChart = (data) => {

    let imageurl = imagechart_api;
    imageurl = imageurl + "chco=D32F2F|F57C00|FBC02D|388E3C|1976D2|303F9F|7B1FA2&";
    imageurl = imageurl + "chs=900x900&";
    imageurl += "cht=p&";
    imageurl = imageurl + "chd=t:" + data[0][0] + "," + data[1][0] + "," + data[2][0] + "," + data[3][0] + "," + data[4][0] + "," + data[5][0] + "," + data[6][0] + "&"
    imageurl = imageurl + "chdl=" + data[6][1] + "|" + data[5][1] + "|" + data[4][1] + "|" + data[3][1] + "|" + data[2][1] + "|" + data[1][1] + "|" + data[0][1] + "&"
    imageurl += "chdlp=l|r&";
    imageurl = imageurl + "chdls=000000,40&";
    imageurl = imageurl + "chf=bg,s,e5eeed";
    console.log(imageurl);

    $("#piechart").html("<img width='100%' alt='Pie Chart' src='" + imageurl + "'>");

}


let getPieChartData = (user_id) => {
    $.ajax({
        "url": endpoint01 + "/userstat",
        "data": "admin_id=" + localStorage.admin_id + "&user_id=" + user_id,
        "method": "GET",
        "success": (results) => {
            console.log(results);
            $('#piechart').html('');
            $('#oneHistory_message').html('');
            $('#oneHistory_message').removeClass();

            let newdata = []
            for (let i = 0; i < results.length; i += 2) {

                let item = []; //line items that only stores
                item[0] = results[i + 1].slice(0, -1).trim()
                item[1] = results[i];

                newdata[i] = item;
            }
            console.log(newdata);

            newdata.sort(function (pos1, pos2) { return pos2[0] - pos1[0] }); // compare two postive value and return; positive number biggest to smallest
            console.log(newdata);

            plotPieChart(newdata);

        },
        "error": (data) => {
            console.log(data);
            $('#oneHistory_message').html('An error has occurred. Please refresh the page!');
            $('#oneHistory_message').addClass("alert alert-danger text-center");
        }
    })
}


let plotBarChart = (data) => {

    let imageurl = imagechart_api;
    imageurl = imageurl + "chco=D32F2F|F57C00|FBC02D|388E3C|1976D2|303F9F|7B1FA2&"
    imageurl = imageurl + "chd=t:" + data[0][0] + "," + data[1][0] + "," + data[2][0] + "," + data[3][0] + "," + data[4][0] + "," + data[5][0] + "," + data[6][0] + "&"
    imageurl = imageurl + "chds=0," + data[0][0] + "&"
    imageurl = imageurl + "chs=700x700&"
    imageurl = imageurl + "cht=bhs&"
    imageurl = imageurl + "chxl=1:|" + data[6][1] + "|" + data[5][1] + "|" + data[4][1] + "|" + data[3][1] + "|" + data[2][1] + "|" + data[1][1] + "|" + data[0][1] + "&"
    imageurl = imageurl + "chxt=x,y&";
    imageurl = imageurl + "chf=bg,s,e5eeed";
    console.log(imageurl);

    $("#barchart").html("<img width='60%' id='barchart' alt='Bar Chart' src='" + imageurl + "'>");

}


let getBarChartData = () => {
    $.ajax({
        "url": endpoint01 + "/allstat",
        "data": "admin_id=" + localStorage.admin_id,
        "method": "GET",
        "success": (results) => {
            $('#barchart').html('');
            $('#barchart_message').html('');
            $('#barchart_message').removeClass();


            if (results.length > 0) {
                console.log(results);
                let newdata = []
                for (let i = 0; i < results.length; i += 2) {

                    let item = []; //line items that only stores
                    item[0] = results[i + 1]
                    item[1] = results[i]

                    newdata[i] = item;
                }
                console.log(newdata);

                newdata.sort(function (pos1, pos2) { return pos2[0] - pos1[0] }); // compare two postive value and return; positive number biggest to smallest
                console.log(newdata);

                plotBarChart(newdata);
            } else {
                $('#barchart_message').html("<h3>No Records of Student Scan</h3>");
            }
        },
        "error": (data) => {
            console.log(data);
            $('#barchart_message').html('An error has occurred. Please refresh the page!');
            $('#barchart_message').addClass("alert alert-danger text-center");
        }
    })
}


let historyController = (userID, fullname) => {
    $('#div-adminhistory').hide();
    $('#div-onehistory').show();

    $('#oneUserEmotion').html("<h1>" + fullname + "</h1>");
    console.log(userID);
    console.log(fullname);

    $.ajax({
        "url": endpoint01 + "/userstat",
        "data": "admin_id=" + localStorage.admin_id + "&user_id=" + userID,
        "method": "GET",
        "success": (results) => {
            $('#oneHistory_message').html('');
            $('#oneHistory_message').removeClass();
            console.log(results);
            let no_record = 0;
            let userEmotion = "<ul>"
            for (let i = 0; i < results.length; i += 2) {
                userEmotion += "<li>" + "<b>" + results[i] + "</b>" + ": " + results[i + 1] + "</li>";
                if (results[i + 1] == '0.00%') {
                    no_record += 1;
                }
            }
            userEmotion += "</ul>";
            $('#oneUserEmotion').append(userEmotion);
            if (no_record == 7) {
                console.log('no record');
                $('#piechart').hide();
                $('#btn-allscan').hide();
            } else {
                scan_history(userID);
                $('#piechart').show();
                getPieChartData(userID);
                $('#btn-allscan').show();

            }
        },
        "error": (data) => {
            console.log(data);
            $('#oneHistory_message').html('An error has occurred. Please refresh the page!');
            $('#oneHistory_message').addClass("alert alert-danger text-center");
        }
    })

}


let historyTableController = () => {

    $.ajax({
        "url": endpoint01 + "/users",
        "data": "admin_id=" + localStorage.admin_id,
        "method": "GET",
        "success": (results) => {
            console.log(results);
            $('#historyTable').html('');
            $('#historyTable_message').html('');
            $("#historyTable_message").removeClass();

            if (results.length > 0) {

                let userList = "<table style='width:50%;'><tr><th>Students</th></tr>";

                for (let i = 0; i < results.length; i++) {
                    let full_name = results[i]['firstname'] + " " + results[i]['lastname'];
                    userList += "<tr><td><a href='#'style='text-decoration: none;' onclick='historyController(\"" + results[i]["user_id"] + "\",\"" + full_name + "\")'>" + full_name + "</a></td></tr>";
                }

                userList += "</table>";

                $('#historyTable').html(userList);
            } else {
                $('#historyTable_message').html("<h3>No Records of Students</h3>");
            }
        },
        "error": (data) => {
            console.log(data);
            $('#historyTable_message').html('An error has occurred. Please refresh the page!');
            $("#historyTable_message").addClass("alert alert-danger text-center");

        }
    })

}


let deleteUserController = (userId) => {
    console.log('user_id:' + userId);

    // Get the modal
    var modal = document.getElementById("myModal");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];
    modal.style.display = "block";

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    $('#deleteUser').click(() => {
        console.log('delete user');

        $.ajax({
            "url": endpoint01 + "/users",
            "data": "user_id=" + userId,
            "method": "DELETE",
            "success": (results) => {
                console.log(results);

                modal.style.display = "none";
                tableController();
            },
            "error": (data) => {
                console.log(data);
                $('#tablelist_message').html('An error has occurred while deleting a user. Please refresh the page and try again!');
                $("#tablelist_message").addClass("alert alert-danger text-center");
            }
        })
    })

}


let tableController = () => {

    $.ajax({
        "url": endpoint01 + "/users",
        "data": "admin_id=" + localStorage.admin_id,
        "method": "GET",
        "success": (results) => {
            console.log(results);
            $('#tablelist_message').html("");
            $("#tablelist_message").removeClass();

            if (results.length > 0) {

                let alluser = "<table id='userTable'>";
                alluser += "<tr>";
                alluser += "<th> First Name </th>";
                alluser += "<th> Last Name </th>";
                alluser += "<th> Username </th>";
                alluser += "<th> Password </th>";
                alluser += "<th> Remove Student </th>";
                alluser += "<tr>";

                for (let i = 0; i < results.length; i++) {
                    alluser += "<tr>";
                    alluser += "<td>" + results[i]["firstname"] + "</td>";
                    alluser += "<td>" + results[i]["lastname"] + "</td>";
                    alluser += "<td>" + results[i]["username"] + "</td>";
                    alluser += "<td>" + results[i]["password"] + "</td>";
                    alluser += "<td>" + "<input type='button' class='btn-adminremove' value='Remove' onclick='deleteUserController(" + results[i]["user_id"] + ")'>" + "</td>";
                    alluser += "</tr>"
                }
                alluser += "</table>";

                $('#tableofstudents').html(alluser);

            } else {
                $('#tableofstudents').html("<h3>No Records of Students</h3>");
            }

        },
        "error": (data) => {
            console.log(data);
            $('#tablelist_message').html('An error has occurred. Please refresh the page!');
            $('#tablelist_message').addClass('alert alert-danger text-center');
        }

    })

}


let addUserController = () => {

    $("#adduser_message").html("");
    $("#adduser_message").removeClass();

    let firstname = $("#adduser-firstname").val();
    let lastname = $("#adduser-lastname").val();

    if (firstname == "") {
        $('#adduser_message').html('First name is required.');
        $('#adduser_message').addClass("alert alert-danger");
        return; //quit the function now!   
    }
    if (lastname == "") {
        $('#adduser_message').html('Last name is required.');
        $('#adduser_message').addClass("alert alert-danger");
        return; //quit the function now!   
    }

    $("#adduser-firstname").val(firstname[0].toUpperCase() + firstname.substr(1, (firstname.length - 1)));
    $("#adduser-lastname").val(lastname[0].toUpperCase() + lastname.substr(1, (lastname.length - 1)));
    // serialize the data
    let the_serialized_data = $("#form-adduser").serialize();
    console.log(the_serialized_data);

    // next things to do is to write an ajax call
    $.ajax({
        "url": endpoint01 + "/users",
        "data": the_serialized_data + "&admin_id=" + localStorage.admin_id,
        "method": "POST",
        "success": (results) => {
            console.log(results);
            $('#adduser_message').html("");
            $("#adduser_message").removeClass();

            $(".content-wrapper").hide();
            $("#div-adminhome").show();
            $("#div-userform").hide();
            $("#adduser-firstname").val("");
            $("#adduser-lastname").val("");
            $('#btn-adduser').show();

            tableController();

        },
        "error": (data) => {
            console.log(data);
            $("#adduser_message").html("Add student failed. Please try again!");
            $("#adduser_message").addClass("alert alert-danger text-center");
        }
    })


}


let traitsController = (traits, emotion) => {

    let messages;

    if (face_num == 1) {

        let age = traits['age']['value']
        let gender = traits['gender']['value']
        let glass = traits['glass']['value']
        let glasses;

        if (glass == 'None') {
            glasses = 'without glasses';
        } else if (glass == 'Normal') {
            glasses = 'with glasses';
        } else { // dark
            glasses = 'with sun glasses';
        }

        messages = "The picture above shows a" + age + "year old" + gender + glasses + "who's emotion is" + emotion;

    } else if (face_num > 1) {
        messages = "We have detected more than one face. Currently, we only support processing one face at a time. Please try again!";
    } else {
        messages = "We did not detech a human face in the photo. Please try again!";
    }

    streamAudio(tts_api, messages);

}


// Define the audio context outside to ensure it's available throughout the script's scope
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

//async function playAudioData(audioChunks) {
let playAudioData = async (audioChunks) => {
    // Combine all chunks into a single Uint8Array
    const combinedData = new Uint8Array(audioChunks.reduce((acc, val) => acc.concat(Array.from(val)), []));
    const arrayBuffer = combinedData.buffer;

    // Decode and play the combined audio data
    audioContext.decodeAudioData(arrayBuffer.slice(0), (buffer) => {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
    }, (e) => console.error('Error decoding audio data', e));
}


//async function streamAudio(url) {
let streamAudio = async (url, messages) => {
    let audioChunks = []; // Use an array to collect audio data chunks
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': 'API_KEY', // Replace with the actual API key
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "model": "tts-1-hd",
                "input": messages,
                "voice": "echo" // Other voice options: alloy echo nova
            })
        });

        if (!response.body) {
            throw new Error('ReadableStream not yet supported in this browser.');
        }

        const reader = response.body.getReader();

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                console.log('Stream completed');
                playAudioData(audioChunks); // Once all chunks are received, play the combined data
                break;
            }

            // Collect each chunk of audio data
            audioChunks.push(value);
        }
    } catch (err) {
        console.error('Fetch error:', err);
        $('#audioFail_message').html('An error has occurred playing the audio. Please refresh the page and try again!');
        $('#audioFail_message').addClass('alert alert-danger text-center');
    }
}


let emotionController = (emotion) => {
    emotion = emotion.slice(0, -2).trim();

    $.ajax({
        "url": endpoint01 + "/scan",
        "data": "user_id=" + localStorage.user_id + "&emotion=" + emotion,
        "method": "POST",
        "success": (results) => {
            console.log(results);
        },
        "error": (data) => {
            console.log(data);
        }
    })
}


let createAccountController = () => {

    $("#createaccount_message").html("");
    $("#createaccount_message").removeClass();

    let firstname = $("#createaccount-firstname").val();
    let lastname = $("#createaccount-lastname").val();
    let username = $("#createaccount-username").val();
    let password = $("#createaccount-password").val();
    let confirmation_password = $("#createaccount-confirmpassword").val();
    let email = $("#createaccount-email").val();

    if (firstname == "") {
        $('#createaccount_message').html('First name is required.');
        $('#createaccount_message').addClass("alert alert-danger");
        return; //quit the function now!   
    }
    if (lastname == "") {
        $('#createaccount_message').html('Last name is required.');
        $('#createaccount_message').addClass("alert alert-danger");
        return; //quit the function now!   
    }
    if (username == "") {
        $('#createaccount_message').html('Username is required.');
        $('#createaccount_message').addClass("alert alert-danger");
        return; //quit the function now!   
    }
    if (password == "") {
        $('#createaccount_message').html('Password is required.');
        $('#createaccount_message').addClass("alert alert-danger");
        return; //quit the function now!   
    }
    if (confirmation_password == "") {
        $('#createaccount_message').html('Confirmation password is required.');
        $('#createaccount_message').addClass("alert alert-danger");
        return; //quit the function now!   
    }
    if (password != confirmation_password) {
        $('#createaccount_message').html('Password and confirmation password must match.');
        $('#createaccount_message').addClass("alert alert-danger");
        return; //quit the function now!   
    }
    if (email == "") {
        $('#createaccount_message').html('Email is required.');
        $('#createaccount_message').addClass("alert alert-danger");
        return; //quit the function now!   
    }

    $("#createaccount-firstname").val(firstname[0].toUpperCase() + firstname.substr(1, (firstname.length - 1)));
    $("#createaccount-lastname").val(lastname[0].toUpperCase() + lastname.substr(1, (lastname.length - 1)));
    // serialize the data
    let the_serialized_data = $("#form-createaccount").serialize();
    console.log(the_serialized_data);

    // next things to do is to write an ajax call
    $.ajax({
        "url": endpoint01 + "/admin",
        "data": the_serialized_data,
        "method": "POST",
        "success": (results) => {
            console.log(results);
            $('#createaccount_message').html("");
            $("#createaccount_message").removeClass();

            console.log('bubble');
            console.log(results);

            if (!isNaN(results) && results == parseInt(results)) {
                $(".content-wrapper").hide();
                $("#div-login").show();
                $(".nav-link").hide();
                localStorage.removeItem("user_id");
                localStorage.removeItem("admin_id");

                $("#createaccount-firstname").val("");
                $("#createaccount-lastname").val("");
                $("#createaccount-username").val("");
                $("#createaccount-password").val("");
                $("#createaccount-confirmpassword").val("");
                $("#createaccount-email").val("");

                $("#login-username").val(username);
                $("#login-password").val(password);
            } else {
                // Just in case else statement; it should go to "error"
                $("#createaccount_message").html("Make account failed. Please try again!")
                $('#createaccount_message').addClass("alert alert-danger");
            }

        },
        "error": (data) => {
            console.log(data);
            $("#createaccount_message").html("Make account failed. Please try again!");
            $("#createaccount_message").addClass("alert alert-danger");
        }
    })

}


// Function to turn off the camera
let turnOffCamera = () => {
    if (window.stream) {
        window.stream.getTracks().forEach(track => track.stop());
        window.stream = null; // Clear the global stream reference
    }
}


// Function to upload the image
let uploadImage = (blob) => {
    const formData = new FormData();
    formData.append('image_file', blob, 'captured_image.png');

    // Construct the params string or use URLSearchParams
    const params = `api_key=${apiKey}&api_secret=${apiSecret}&return_attributes=gender,age,smiling,headpose,facequality,blur,eyestatus,emotion,beauty`;

    $.ajax({
        url: `${apiEndpoint}?${params}`,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
            console.log('Success:', data);
            //console.log(data.faces[0]["attributes"]["emotion"]);
            face_num = data.face_num;

            //console.log(face_num);

            if (face_num == 1) {
                let anger = data.faces[0]["attributes"]["emotion"]["anger"];
                let disgust = data.faces[0]["attributes"]["emotion"]["disgust"];
                let fear = data.faces[0]["attributes"]["emotion"]["fear"];
                let happiness = data.faces[0]["attributes"]["emotion"]["happiness"];
                let neutral = data.faces[0]["attributes"]["emotion"]["neutral"];
                let sadness = data.faces[0]["attributes"]["emotion"]["sadness"];
                let surprise = data.faces[0]["attributes"]["emotion"]["surprise"];

                let emotion_list = ["Angry 😠", anger, "Disgusted 🤮", disgust, "Scared 😨", fear, "Happy 🙂", happiness, "Neutral 😐", neutral, "Sad 😔", sadness, "Surprised 😯", surprise]

                let num = 0;
                let emotion = "";

                for (let i = 1; i < emotion_list.length; i += 2) {
                    if (num < emotion_list[i]) {
                        num = emotion_list[i];
                        emotion = emotion_list[i - 1];
                    }
                }

                traits = data.faces[0]["attributes"];
                emo_audio = emotion.slice(0, -2).trim();

                emotionController(emotion);
                traitsController(traits, emo_audio);

                $(".content-wrapper").hide();
                $('#camera_scan').show();

                $('#emotion_display').html('');
                $('#emotion_display').removeClass();

                $('#emotion_display').html("<h1 style='text-align:center;'>" + emotion + "</h1>");

            } else if (face_num > 1) {
                //console.log('More than one face');
                $(".content-wrapper").hide();
                $('#camera_scan').show();
                $('#emotion_display').removeClass();
                $('#emotion_display').html('');
                $('#emotion_display').html("We have detected more than one face. Currently, we only support processing one face at a time. Please try again!");
                $('#emotion_display').addClass('alert alert-danger');
                traitsController(traits, emo_audio);
            } else {
                //console.log('No face');
                $(".content-wrapper").hide();
                $('#camera_scan').show();
                $('#emotion_display').removeClass();
                $('#emotion_display').html('');
                $('#emotion_display').html("We did not detech a human face in the photo. Please try again!");
                $('#emotion_display').addClass('alert alert-danger');
                traitsController(traits, emo_audio);
            }

        },
        error: function (xhr, status, error) {
            console.error('Error:', error);
            $('#camera_message').html('An error has occurred capturing the image. Please refresh the page and try again!');
            $('#camera_message').addClass('alert alert-danger text-center');
        }
    });
}


//document ready section
$(document).ready(() => {

    /* ----------------- force this page to be https ------- */
    let loc = window.location.href + '';
    if (loc.indexOf('http://') == 0) {
        window.location.href = loc.replace('http://', 'https://');
    }


    /* ----------------- set up emotion scan ------- */
    const video = document.getElementById('cameraStream');

    const canvas = document.getElementById('canvas');

    let loginController = () => {
        //clear any previous messages
        $('#login_message').html("");
        $('#login_message').removeClass();

        //error trapping.
        let username = $("#login-username").val();
        let password = $("#login-password").val();
        if (username == "" || password == "") {
            $('#login_message').html('The username and password are both required.');
            $('#login_message').addClass("alert alert-danger text-center");
            return; //quit the function now!   
        }

        let the_serialized_data = $("#form-login").serialize();
        console.log(the_serialized_data);

        /* login */
        $.ajax({
            "url": endpoint01 + "/auth",
            "data": the_serialized_data,
            "method": "GET",
            "success": (results) => {
                console.log(results);
                if (results.length > 0) {
                    //what happens when the login is good
                    localStorage.user_id = results[0]["user_id"];
                    localStorage.admin_id = results[0]["admin_id"];

                    //manage the appearence of things...
                    $('#login_message').html('');
                    $('#login_message').removeClass();

                    $('.secured').removeClass('locked');
                    $('.secured').addClass('unlocked');

                    $('#div-login').hide(); //hide the login page
                    $('#link-logout').show();

                    console.log(localStorage.user_id);
                    console.log(localStorage.admin_id);

                    if (!isNaN(localStorage.user_id) && !isNaN(localStorage.admin_id)) {
                        localStorage.removeItem("admin_id");

                        $('#div-scan').show();   //show the default page
                        $('#link-admincreateaccount').hide();
                        $('#link-adminstats').hide();
                        $('#link-adminhistory').hide();
                        $('#link-adminhome').hide();

                        turnOffCamera(); // Ensure the camera is turned off before trying again
                        setupCamera(); // Reset the camera

                        console.log('Login as USER');

                    } else if (!isNaN(localStorage.admin_id)) {
                        localStorage.removeItem("user_id");

                        $('#div-adminhome').show();   //show the default page
                        $('.nav-link').show();

                        tableController();
                        getBarChartData();
                        historyTableController();

                        console.log('Login as ADMIN');
                    }

                } else {
                    //what happens when the login is bad
                    localStorage.removeItem("user_id");
                    localStorage.removeItem("admin_id");

                    // Just in case else statement; it should go to "error"
                    $('#login_message').html("Login failed. Please try again!");
                    $('#login_message').addClass("alert alert-danger text-center");
                }
            },
            "error": (data) => {
                console.log(data);

                //what happens when there is an unexpected error
                localStorage.removeItem("user_id");
                localStorage.removeItem("admin_id");

                $('#login_message').html("Username or password is incorrect. Please try again!");
                $('#login_message').addClass("alert alert-danger text-center");
            } //both can be called results
        });

        //scroll to top of page
        $("html, body").animate({ scrollTop: "0px" });
    };


    // Function to request camera access and setup the stream
    let setupCamera = () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(mediaStream => {
                    window.stream = mediaStream; // Store the stream globally for later use
                    video.srcObject = mediaStream;
                    video.play();
                    video.style.display = ''; // Ensure the video is visible
                })
                .catch(error => {
                    console.error("Error accessing the camera", error);
                    $('#camera_message').html('An error has occurred accessing the camera. Please refresh the page and try again!');
                    $('#camera_message').addClass('alert alert-danger text-center');
                });
        }
    }


    // Event listener for the capture button
    $("#btn-captureimage").click(() => {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        video.style.display = 'none'; // Optionally hide the video element after capturing

        canvas.toBlob(blob => {
            uploadImage(blob);
            turnOffCamera(); // Turn off the camera after capturing the image
        }, 'image/png');
    });



    /* ----------------- start up navigation -----------------*/
    /* controls what gets revealed when the page is ready     */

    /* this reveals the default page */
    if (localStorage.user_id) {
        $(".secured").removeClass("locked");
        $(".secured").addClass("unlocked");

        $("#div-scan").show();
        $('#link-admincreateaccount').hide();
        $('#link-adminstats').hide();
        $('#link-adminhistory').hide();
        $('#link-adminhome').hide();

        turnOffCamera(); // Ensure the camera is turned off before trying again
        setupCamera(); // Reset the camera

    }
    else if (localStorage.admin_id) {
        $(".secured").removeClass("locked");
        $(".secured").addClass("unlocked");

        $("#div-adminhome").show();
        $('.nav-link').show();
        tableController();

    }
    else {
        $("#div-login").show(); // CTRL-SHIFT-R home page
        $(".secured").removeClass("unlocked");
        $(".secured").addClass("locked");
    }


    /* ------------------  basic navigation -----------------*/
    /* this controls navigation - show / hide pages as needed */

    /* links on the menu */

    /* hide all scan clicked */
    $('#btn-hideallscan').click(() => {
        $('#scan_time').hide();
        $('#btn-hideallscan').hide();
        $('#btn-allscan').show();
    })

    /* show all scan clicked */
    $('#btn-allscan').click(() => {
        $('#scan_time').show();
        $('#btn-allscan').hide();
        $('#btn-hideallscan').show();
    })

    /* go back clicked */
    $('#link-goback').click(() => {
        $('.content-wrapper').hide();
        $('#div-adminhistory').show();
        $('.nav-link').show();

        historyTableController();
    })

    /* admin form submit clicked */
    $("#btn-submit").click(() => {
        addUserController();
    });

    $("#btn-adduser").click(() => {
        $('#div-userform').show();
        $('#btn-adduser').hide();
    });

    $("#btn-admincancel").click(() => {
        clearFormController();
    });

    /* text to speech clicked */
    $("#btn-tts").click(() => {
        traitsController(traits, emo_audio);
    });

    /* Create account is clicked */
    $('#btn-createaccount').click(() => {
        clearFormController();
        createAccountController()
    });

    /* what happens if any of the navigation links are clicked? */
    $('.nav-link').click(() => {
        $("html, body").animate({ scrollTop: "0px" }); /* scroll to top of page */
        $(".navbar-collapse").collapse('hide'); /* explicitly collapse the navigation menu */
    });

    /* Login button clicked */
    $('#btn-login').click(() => {
        loginController();
    });

    // Handle 'try again' button click to reset camera and potentially retake the photo
    $('#btn-tryagain').click(() => {
        $('#emotion_display').removeClass();
        $('#camera_scan').hide();
        $('#div-scan').show();

        turnOffCamera(); // Ensure the camera is turned off before trying again
        setupCamera(); // Reset the camera
    });


    /* admin home clicked */
    $('#link-adminhome').click(() => {
        clearFormController();

        $('.content-wrapper').hide(); //hide all the things
        $("#div-adminhome").show();
        $('.nav-link').show();
    })

    /* admin create account clicked */
    $('#link-admincreateaccount').click(() => {
        $('.content-wrapper').hide(); //hide all the things
        $('#div-createaccount').show();
        $('.nav-link').show();

    })

    /* admin history clicked */
    $('#link-adminhistory').click(() => {
        $('.content-wrapper').hide(); //hide all the things
        $('#div-adminhistory').show(); //show the one thing
        $('.nav-link').show();
        $('#scan_time').hide();
        $('#btn-hideallscan').hide();

        historyTableController();
    })

    /* admin statistics clicked */
    $('#link-adminstats').click(() => {
        $('.content-wrapper').hide(); //hide all the things
        $('#div-adminstats').show(); //show the one thing
        $('.nav-link').show();

        getBarChartData();
    })

    /* Logout clicked */
    $('#link-logout').click(() => {
        // First ... remove user_id from localstorage
        localStorage.removeItem("user_id");
        localStorage.removeItem("admin_id");
        // Now force the page to refresh
        window.location = "./index.html";
    });

}); /* end the document ready event*/