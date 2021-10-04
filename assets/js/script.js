var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


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
    console.log(list, arr);
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
  var date = $(this)
    .text()
    .trim();
  
  // Create input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  // Swap the elements, displaying date input
  $(this).replaceWith(dateInput);

  // Focus on new element
  dateInput.trigger("focus");
});

// When user changes the date element
$(".list-group").on("blur", "input[type='text']", function() {
  // Get updated text
  var date = $(this)
    .val()
    .trim();
    
  // Get parent <ul>'s ID
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  
  // Get task's position in list of <li> elements
  var index = $(this)
    .closest(".list-group-item")
    .index();
  
  // Update task in array, resave to local storage
  tasks[status][index].date = date;
  saveTasks();

  // Rebuild span element with bootstrap
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);
  
  // Replace input with <span>
  $(this).replaceWith(taskSpan);
});

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
$("#task-form-modal .btn-primary").click(function() {
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

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


