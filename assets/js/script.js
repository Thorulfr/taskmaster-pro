var tasks = {};

// Make task card lists sortable
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event, ui) {
    $(this).addClass("dropover");
    $(".bottom-trash").addClass("bottom-trash-drag");
  },
  deactivate: function(event, ui) {
    $(this).removeClass("dropover");
    $(".bottom-trash").removeClass("bottom-trash-drag");
  },
  over: function(event) {
    $(event.target).addClass("dropover-active");
  },
  out: function(event) {
    $(event.target).removeClass("dropover-active");
  },
  update: function(event) {
    var tempArr = [];
    // Loop over the current set of children in sortable list
    $(this).children().each(function() {
      var text = $(this)
        .find("p")
        .text()
        .trim();
      var date = $(this)
        .find("span")
        .text()
        .trim();
      // Add task data to the temporary array
      tempArr.push({
        text: text,
        date: date
      })
    });
    // trim down list's ID to match the object property
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");
    // Update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  }
});

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(taskDate);
  var taskP = $("<p>").addClass("m-1").text(taskText);
  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);
  // Check due date
  auditTask(taskLi);
  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// When a user clicks a stored task, convert to editable form element
$(".list-group").on("click", "p", function () {
  var text = $(this)
    .text()
    .trim();
  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
});

// When user clicks out of editing task, save and return as <p>
$(".list-group").on("blur", "textarea", function () {
  // Get current, updated value/text
  var text = $(this)
  .val()
  .trim();
  
  // Get the parent ul's ID
  var status = $(this)
  .closest(".list-group")
  .attr("id")
  .replace("list-", "");
  
  // Get the tasks' position in the list of other <li> elements
  var index = $(this)
  .closest(".list-group-item")
  .index();
  
  tasks[status][index].text = text;
  saveTasks();
  
  // Rebuild <p> element
  var taskP = $("<p>")
  .addClass("m-1")
  .text(text);
  $(this).replaceWith(taskP);
});

// When user clicks on due date, make editable
$(".list-group").on("click", "span", function() {
  // Get current date
  var date = $(this).text().trim();
  // Create new input element
  var dateInput = $("<input>").attr("type", "text").addClass("form-control").val(date);
  $(this).replaceWith(dateInput);
  // Enable jQuery UI datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function() {
      // When the calendar is closed, force a "change" event on dateInput to trigger the update/save function below
      $(this).trigger("change");
    }
  });
  // Autofocus on calendar
  dateInput.trigger("focus");
});

// When user changes the date 
$(".list-group").on("change", "input[type='text']", function() {
  // Get updated text
  var date = $(this).val().trim();
  // Get parent <ul>'s ID
  var status = $(this).closest(".list-group").attr("id").replace("list-", "");
  // Get task's position in list of <li> elements
  var index = $(this).closest(".list-group-item").index();
  // Update task in array, resave to local storage
  tasks[status][index].date = date;
  saveTasks();
  // Rebuild span element with bootstrap
  var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(date);
  // Replace input with <span>
  $(this).replaceWith(taskSpan);
  // Pass the tasks' <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
});

// Date Auditing
var auditTask = function(taskEl) {
  // Get date from the task element
  var date = $(taskEl).find("span").text().trim();
  // Convert to Moment object with time 5:00 p.m.
  var time = moment(date, "L").set("hour", 17);
  // Remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");
  // Apply a new class if the task is near or over the due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  } else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }
};

// Automate Date Auditing Intervalically
setInterval(function() {
  $(".card .list-group-item").each(function(index, el) {
    auditTask(el);
  });
}, (1000*60)*30);

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-save").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();
  
  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");
    
    // close modal
    $("#task-form-modal").modal("hide");
    
    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });
    
    saveTasks();
  }
});

// Add datepicker to modal
$("#modalDueDate").datepicker({
  minDate: 1
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// Add trash function to "Remove" area
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove();
  },
  over: function(event, ui) {
    $(".bottom-trash").addClass("bottom-trash-active");
  },
  out: function(event, ui) {
    $(".bottom-trash").removeClass("bottom-trash-active");
  }
})

// load tasks for the first time
loadTasks();


