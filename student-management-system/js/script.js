/* =========================================
   Student Management System
   Final Web Development Project
========================================= */

/* =========================================
   Initial Data
========================================= */

const defaultStudents = [
  {
    id: 1,
    name: "Aman Sharma",
    rollNo: "101",
    course: "CSE",
    marks: 86,
  },

  {
    id: 2,
    name: "Riya Verma",
    rollNo: "102",
    course: "IT",
    marks: 74,
  },

  {
    id: 3,
    name: "Karan Singh",
    rollNo: "103",
    course: "ECE",
    marks: 91,
  },
];

let students = [];

let editingId = null;

/* =========================================
   Selecting HTML Elements
========================================= */

const studentForm = document.getElementById("studentForm");

const studentName = document.getElementById("studentName");

const rollNumber = document.getElementById("rollNumber");

const course = document.getElementById("course");

const marks = document.getElementById("marks");

const submitButton = document.getElementById("submitButton");

const cancelButton = document.getElementById("cancelButton");

const searchInput = document.getElementById("searchInput");

const filterCourse = document.getElementById("filterCourse");

const sortStudents = document.getElementById("sortStudents");

const studentTableBody = document.getElementById("studentTableBody");

const emptyMessage = document.getElementById("emptyMessage");

const recordCount = document.getElementById("recordCount");

const totalStudents = document.getElementById("totalStudents");

const averageMarks = document.getElementById("averageMarks");

const highestMarks = document.getElementById("highestMarks");

const passingStudents = document.getElementById("passingStudents");

/* =========================================
   Local Storage
========================================= */

function loadStudents() {
  const savedStudents = localStorage.getItem("studentRecords");

  if (savedStudents) {
    students = JSON.parse(savedStudents);
  } else {
    students = [...defaultStudents];
  }
}

function saveStudents() {
  localStorage.setItem("studentRecords", JSON.stringify(students));
}

/* =========================================
   Grade Calculation
========================================= */

function calculateGrade(mark) {
  if (mark >= 90) {
    return "A+";
  } else if (mark >= 80) {
    return "A";
  } else if (mark >= 70) {
    return "B";
  } else if (mark >= 60) {
    return "C";
  } else if (mark >= 50) {
    return "D";
  } else {
    return "F";
  }
}

/* =========================================
   Pass / Fail
========================================= */

function getStatus(mark) {
  if (mark >= 40) {
    return "Pass";
  } else {
    return "Fail";
  }
}

/* =========================================
   Form Validation
========================================= */

function validateForm() {
  const errors = {
    name: "",
    roll: "",
    course: "",
    marks: "",
  };

  const nameValue = studentName.value.trim();

  const rollValue = rollNumber.value.trim();

  const courseValue = course.value;

  const marksValue = marks.value;

  if (nameValue === "") {
    errors.name = "Please enter student name.";
  } else if (nameValue.length < 2) {
    errors.name = "Name must contain at least 2 characters.";
  }

  if (rollValue === "") {
    errors.roll = "Please enter roll number.";
  }

  if (courseValue === "") {
    errors.course = "Please select a course.";
  }

  if (marksValue === "") {
    errors.marks = "Please enter marks.";
  } else if (Number(marksValue) < 0 || Number(marksValue) > 100) {
    errors.marks = "Marks must be between 0 and 100.";
  }

  const duplicateRoll = students.some(function (student) {
    return (
      student.rollNo.toLowerCase() === rollValue.toLowerCase() &&
      student.id !== editingId
    );
  });

  if (duplicateRoll) {
    errors.roll = "This roll number already exists.";
  }

  displayErrors(errors);

  return (
    errors.name === "" &&
    errors.roll === "" &&
    errors.course === "" &&
    errors.marks === ""
  );
}

/* =========================================
   Display Errors
========================================= */

function displayErrors(errors) {
  document.getElementById("nameError").textContent = errors.name;

  document.getElementById("rollError").textContent = errors.roll;

  document.getElementById("courseError").textContent = errors.course;

  document.getElementById("marksError").textContent = errors.marks;
}

function clearErrors() {
  displayErrors({
    name: "",
    roll: "",
    course: "",
    marks: "",
  });
}

/* =========================================
   Clear Form
========================================= */

function clearForm() {
  studentName.value = "";

  rollNumber.value = "";

  course.value = "";

  marks.value = "";

  editingId = null;

  submitButton.textContent = "Add Student";

  cancelButton.classList.add("hidden");

  clearErrors();
}

/* =========================================
   Add / Update Student
========================================= */

studentForm.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  const studentData = {
    name: studentName.value.trim(),

    rollNo: rollNumber.value.trim(),

    course: course.value,

    marks: Number(marks.value),
  };

  if (editingId !== null) {
    const index = students.findIndex(function (student) {
      return student.id === editingId;
    });

    if (index !== -1) {
      students[index] = {
        id: editingId,

        ...studentData,
      };
    }

    alert("Student record updated successfully.");
  } else {
    const newStudent = {
      id: Date.now(),

      ...studentData,
    };

    students.push(newStudent);

    alert("Student added successfully.");
  }

  saveStudents();

  clearForm();

  applyFiltersAndSort();
});

/* =========================================
   Edit Student
========================================= */

function editStudent(id) {
  const student = students.find(function (item) {
    return item.id === id;
  });

  if (!student) {
    return;
  }

  studentName.value = student.name;

  rollNumber.value = student.rollNo;

  course.value = student.course;

  marks.value = student.marks;

  editingId = id;

  submitButton.textContent = "Update Student";

  cancelButton.classList.remove("hidden");

  clearErrors();

  document.getElementById("add-student").scrollIntoView({
    behavior: "smooth",
  });
}

/* =========================================
   Delete Student
========================================= */

function deleteStudent(id) {
  const student = students.find(function (item) {
    return item.id === id;
  });

  if (!student) {
    return;
  }

  const confirmation = confirm(`Delete ${student.name}'s record?`);

  if (!confirmation) {
    return;
  }

  students = students.filter(function (item) {
    return item.id !== id;
  });

  if (editingId === id) {
    clearForm();
  }

  saveStudents();

  applyFiltersAndSort();

  alert("Student record deleted.");
}

/* =========================================
   Search + Filter + Sort
========================================= */

function applyFiltersAndSort() {
  const searchText = searchInput.value.trim().toLowerCase();

  const selectedCourse = filterCourse.value;

  const selectedSort = sortStudents.value;

  let result = students.filter(function (student) {
    const matchesSearch =
      student.name.toLowerCase().includes(searchText) ||
      student.rollNo.toLowerCase().includes(searchText);

    const matchesCourse =
      selectedCourse === "all" || student.course === selectedCourse;

    return matchesSearch && matchesCourse;
  });

  /* Sorting */

  if (selectedSort === "nameAsc") {
    result.sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
  } else if (selectedSort === "nameDesc") {
    result.sort(function (a, b) {
      return b.name.localeCompare(a.name);
    });
  } else if (selectedSort === "marksHigh") {
    result.sort(function (a, b) {
      return Number(b.marks) - Number(a.marks);
    });
  } else if (selectedSort === "marksLow") {
    result.sort(function (a, b) {
      return Number(a.marks) - Number(b.marks);
    });
  }

  renderStudents(result);

  updateStatistics();
}

/* =========================================
   Render Table
========================================= */

function renderStudents(list) {
  studentTableBody.innerHTML = "";

  if (list.length === 0) {
    emptyMessage.style.display = "block";
  } else {
    emptyMessage.style.display = "none";
  }

  for (let i = 0; i < list.length; i++) {
    const student = list[i];

    const row = document.createElement("tr");

    const grade = calculateGrade(Number(student.marks));

    const status = getStatus(Number(student.marks));

    row.innerHTML = `

            <td>
                ${student.rollNo}
            </td>

            <td>
                ${student.name}
            </td>

            <td>
                ${student.course}
            </td>

            <td>
                ${student.marks}
            </td>

            <td class="grade">
                ${grade}
            </td>

            <td class="${status === "Pass" ? "status-pass" : "status-fail"}">
                ${status}
            </td>

            <td>

                <button
                    class="edit-button"
                    onclick="editStudent(${student.id})"
                >
                    Edit
                </button>

                <button
                    class="delete-button"
                    onclick="deleteStudent(${student.id})"
                >
                    Delete
                </button>

            </td>
        `;

    studentTableBody.appendChild(row);
  }

  recordCount.textContent = `${list.length} record${
    list.length === 1 ? "" : "s"
  }`;
}

/* =========================================
   Statistics
========================================= */

function updateStatistics() {
  totalStudents.textContent = students.length;

  if (students.length === 0) {
    averageMarks.textContent = "0";

    highestMarks.textContent = "0";

    passingStudents.textContent = "0";

    return;
  }

  let total = 0;

  let highest = Number(students[0].marks);

  for (let i = 0; i < students.length; i++) {
    const currentMarks = Number(students[i].marks);

    total += currentMarks;

    if (currentMarks > highest) {
      highest = currentMarks;
    }
  }

  const average = (total / students.length).toFixed(1);

  const passed = students.filter(function (student) {
    return Number(student.marks) >= 40;
  }).length;

  averageMarks.textContent = average;

  highestMarks.textContent = highest;

  passingStudents.textContent = passed;
}

/* =========================================
   Events
========================================= */

searchInput.addEventListener("input", function () {
  applyFiltersAndSort();
});

filterCourse.addEventListener("change", function () {
  applyFiltersAndSort();
});

sortStudents.addEventListener("change", function () {
  applyFiltersAndSort();
});

cancelButton.addEventListener("click", function () {
  clearForm();
});

/* =========================================
   Live Marks Validation
========================================= */

marks.addEventListener("input", function () {
  const value = Number(marks.value);

  if (marks.value !== "" && (value < 0 || value > 100)) {
    document.getElementById("marksError").textContent =
      "Marks must be between 0 and 100.";
  } else {
    document.getElementById("marksError").textContent = "";
  }
});

/* =========================================
   Start Application
========================================= */

loadStudents();

applyFiltersAndSort();
