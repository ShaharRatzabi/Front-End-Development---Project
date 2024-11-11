//Shahar Ratzabi 318802725
//Arad David 318621224

// Grabbing references to various DOM elements
const itemNameTxt = document.getElementById("itemName");
const itemCalories = document.getElementById("ItemCalorie");
const itemCategory = document.getElementById("itemCategory");
const itemDesc = document.getElementById("ItemDesc");
const submitForm = document.getElementById("submitForm");
const caloriesTableBody = document.getElementById("caloriesTableBody");
const caloriesTable = document.getElementById("caloriesTable");
const monthPicker = document.getElementById("monthSelect");
const yearPicker = document.getElementById("yearSelect");
const totalCaloriesText = document.getElementById("totalCalories");
const categoryPicker = document.getElementById("categorySelect");

// Object to map month numbers to their names
const months = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December",
};

// When the window loads, open the database and load initial items
window.onload = async () => {
  await idb.openCaloriesDB("caloriesdb", 1);
  await loadItemIntoTable(await idb.getAllItems());
  loadYearsIntoSelect();
};

// Function to clear form fields after submission
function cleanFormFields() {
  itemNameTxt.value = null;
  itemCalories.value = null;
}

// Populate the year selection dropdown with values from 1990 to the current year
function loadYearsIntoSelect() {
  const currYear = new Date().getFullYear();
  for (let i = 1990; i <= currYear; i++) {
    const newRow = document.createElement("option");
    newRow.innerHTML = i;
    yearPicker.appendChild(newRow);
  }
}

// Load items into the table and calculate total calories
async function loadItemIntoTable(allItems) {
  let totalCalories = 0;
  caloriesTableBody.innerHTML = "";

  // If there are no items, show the "no record" message and hide the table
  if (allItems.length === 0) {
    caloriesTable.classList.add("invisible");
    document.getElementById("noRecord").classList.remove("invisible");
    totalCaloriesText.classList.add("invisible");
  } else {
    // If there are items, display them in the table
    caloriesTable.classList.remove("invisible");
    document.getElementById("noRecord").classList.add("invisible");
    totalCaloriesText.classList.remove("invisible");

    allItems.forEach((item) => {
      const itemKeys = Object.keys(item);
      let childsParam = "";

      // Construct table row content based on item properties
      itemKeys.forEach((param) => {
        if (param === "month") {
          childsParam += "<td>" + months[item[param]] + "</td>";
        } else {
          childsParam += "<td>" + item[param] + "</td>";
        }

        // Calculate total calories
        if (param === "calories") {
          totalCalories += Number(item[param]);
        }
      });

      // Add the row to the table body
      const newRow = document.createElement("tr");
      newRow.innerHTML = childsParam;
      caloriesTableBody.appendChild(newRow);
    });

    // Display the total calories in the designated element
    totalCaloriesText.innerHTML = "Total Calories: " + totalCalories;
  }
}

// Handle form submission to add a new item to the database
submitForm.onsubmit = async (event) => {
  let newItemObject = {
    name: itemNameTxt.value,
    calories: Number(itemCalories.value),
    category: itemCategory.value,
    description: itemDesc.value,
  };

  // Validate that the calories are greater than 0
  if (newItemObject.calories < 0) {
    window.alert("Calories must be over 0!!");
    event.preventDefault(); // Prevent form submission if invalid
  } else {
    // Add item to the database and reset form fields upon success
    idb.addCalories(newItemObject).then((promData) => {
      if (promData) {
        cleanFormFields();
        newItemObject = {}; // Clear the temporary object
        window.alert("Item has been Added successfully!!");
        location.reload(); // Reload the page to show updated data
      }
    });
  }
};

// Object to keep track of filter selections
let DiaryFilter = {
  month: 0,
  year: 0,
  category: 0,
};

// Function to filter diary entries based on selected criteria
async function filterDiary() {
  if (
    DiaryFilter.month === 0 &&
    DiaryFilter.year === 0 &&
    DiaryFilter.category === 0
  ) {
    await loadItemIntoTable(await idb.getAllItems());
  } else {
    const filteredItems = await idb.getCaloriesDueFilter(DiaryFilter);
    await loadItemIntoTable(filteredItems);
  }
}

// Event listeners for filtering based on month, year, and category changes
monthPicker.onchange = async () => {
  DiaryFilter.month = monthPicker.value;
  await filterDiary();
};
yearPicker.onchange = async () => {
  DiaryFilter.year = yearPicker.value;
  await filterDiary();
};
categoryPicker.onchange = async () => {
  DiaryFilter.category = categoryPicker.value;
  await filterDiary();
};
