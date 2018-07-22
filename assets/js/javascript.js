
var timeNow;
var userTime;
var userHour;
var userMinute;
var trainName;
var trainDestination;
var trainTime;
var trainFrequency;

function checkTime() {
    console.log("userTime: " + userTime);
    console.log("timeNow: " + timeNow);

    // adds to userTime until it's after timeNow
    while (moment(userTime).isBefore(timeNow)) {
        userTime = moment(userTime, "YYYY/MM/DD kk:mm").add(trainFrequency,"minutes").format("YYYY/MM/DD kk:mm");
    }
    console.log("New userTime: " + userTime);
}


// Initialize Firebase
var config = {
    apiKey: "AIzaSyDcs4abKHEG8rzr3vS2UyIrQoiC63dkRRI",
    authDomain: "train-scheduler-7f2f8.firebaseapp.com",
    databaseURL: "https://train-scheduler-7f2f8.firebaseio.com",
    projectId: "train-scheduler-7f2f8",
    storageBucket: "",
    messagingSenderId: "502832145957"
};
firebase.initializeApp(config);



var database = firebase.database();

// 2. Button for adding train lines
$("#add-train-btn").on("click", function(event) {
    event.preventDefault();

    // Grabs user input
    trainName = $("#display-train-name").val().trim();
    trainDestination = $("#display-destination").val().trim();
    trainTime = $("#display-first-train-time").val().trim();
    trainFrequency = $("#display-frequency").val().trim();
    
    
    
    // LOGIC
    
    // sets timeNow when you click submit
    timeNow = moment().format("YYYY/MM/DD kk:mm");

    // gets First Train Time from user input | sets date to today
    userHour = trainTime.substring(0,2);
    userMinute = trainTime.substring(3,5);
    userTime = moment().set("hour",userHour).set("minute",userMinute).format("YYYY/MM/DD kk:mm");


    checkTime();

    // formats times as Moment elements, so we can run the .diff function
    var userTimeFormatted = moment(new Date(userTime));
    var timeNowFormatted = moment(new Date(timeNow));
    
    // gets difference between Next Train Coming and timeNow | prints as __ hrs __ mins
    var timeDifference = moment.duration(userTimeFormatted.diff(timeNowFormatted));
    var hoursRemaining = Math.floor(timeDifference.asHours()); // floor bc don't want decimals (i.e. minutes)
    var minutesRemainingUnchanged = timeDifference.asMinutes();
    var minutesRemaining = minutesRemainingUnchanged - (hoursRemaining * 60); // keeps minutes under 60

    // combines hrs and mins into a string
    var timeRemaining;
    if (hoursRemaining > 0) {
        timeRemaining = hoursRemaining + " hrs " + minutesRemaining + " mins";
    } else {
        timeRemaining = minutesRemaining + " mins";
    }


    // Creates local "temporary" object for holding train data
    var newTrain = {
        name: trainName,
        destination: trainDestination,
        frequency: trainFrequency,
        nextArrival: userTime,
        minutesAway: timeRemaining
    };

    // Uploads train data to firebase (database) - using PUSH instead of SET
    database.ref().push(newTrain);

    // Clears all of the inputs
    $("#display-train-name").val("");
    $("#display-destination").val("");
    $("#display-first-train-time").val("");
    $("#display-frequency").val("");

    
});

// 3. Create Firebase event for adding employee to the database and a row in the html when a user adds an entry
database.ref().on("child_added", function(childSnapshot) {
    console.log(childSnapshot.val());

    // Store everything into a variable.
    var trainName = childSnapshot.val().name;
    var trainDestination = childSnapshot.val().destination;
    var trainFrequency = childSnapshot.val().frequency;
    var trainNextArrival = childSnapshot.val().nextArrival;
    var trainMinutesAway = childSnapshot.val().minutesAway;


    // Create the new row
    var newRow = $("<tr>").append(
        $("<td>").text(trainName),
        $("<td>").text(trainDestination),
        $("<td>").text(trainFrequency),
        $("<td>").text(trainNextArrival.substring(11,16)),
        $("<td>").text(trainMinutesAway),
    );

    // Append the new row to the table
    $("#display-new-row").append(newRow);

});

