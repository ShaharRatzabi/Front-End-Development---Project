//Shahar Ratzabi 318802725
//Arad David 318621224

const idb = {};

// Function to open a connection to the IndexedDB database
idb.openCaloriesDB = async (name, version) => {
  return new Promise((resolve, reject) => {
    idb.request = window.indexedDB.open(name, version);

    idb.request.onsuccess = (event) => {
      idb.db = event.target.result; // Store the database reference
      idb.version = idb.db.version;
      console.log("Database opened successfully:", idb.version);
      resolve(idb); // Resolve with the `idb` object
    };

    idb.request.onerror = (event) => {
      console.error("Error opening database", event);
      reject(new Error("Database build failed"));
    };

    idb.request.onupgradeneeded = (event) => {
      idb.db = event.target.result;
      if (!idb.db.objectStoreNames.contains("items")) {
        console.log("Creating object store 'items'");
        const objectStore = idb.db.createObjectStore("items", {
          keyPath: "id",
          autoIncrement: true,
        });

        // Create indexes for querying data by specific fields
        objectStore.createIndex("name", "name");
        objectStore.createIndex("calories", "calories");
        objectStore.createIndex("category", "category");
        objectStore.createIndex("description", "description");
        objectStore.createIndex("month", "month");
        objectStore.createIndex("year", "year");
      }
    };
  });
};

// Function to retrieve all items from the database
idb.getAllItems = async () => {
  return new Promise((resolve) => {
    if (idb.db) {
      const transaction = idb.db.transaction("items", "readonly");
      const store = transaction.objectStore("items");
      const allItems = store.getAll(); // Retrieve all items

      // Event when items are successfully retrieved
      allItems.onsuccess = (event) => {
        const allItems = event.target.result;
        resolve(allItems); // Resolve with the list of items
      };
    }
  });
};

// Function to add a new item to the database
idb.addCalories = async (ItemObject) => {
  return new Promise((res, rej) => {
    const transaction = idb.db.transaction("items", "readwrite");
    const store = transaction.objectStore("items");
    const today = new Date(); // Get the current date

    // Create an object with item details
    const newItem = {
      name: ItemObject.name,
      calories: ItemObject.calories,
      category: ItemObject.category,
      description: ItemObject.description,
      month: today.getMonth() + 1, // Store the current month
      year: today.getFullYear(), // Store the current year
    };

    // Add the new item to the object store
    const request = store.add(newItem);
    request.onsuccess = () => {
      res(true); // Resolve when the item is added successfully
    };

    // Handle error when adding an item
    request.onerror = (event) => {
      rej(false); // Reject if there is an error
    };
  });
};

// Filter items based on a specific term and key
idb.filterListDueTerm = (itemsList, term, termKey) => {
  const filteredList = [];
  if (term != 0) {
    itemsList.forEach((item) => {
      if (item[termKey] == term) {
        filteredList.push(item); // Add matching items to the filtered list
      }
    });
    return filteredList;
  }
  return itemsList; // Return original list if no term is specified
};

// Function to get items based on filter criteria
idb.getCaloriesDueFilter = async (filterObject) => {
  return new Promise((res, rej) => {
    const transaction = idb.db.transaction("items", "readonly");
    const store = transaction.objectStore("items");
    const results = store.getAll(); // Get all items for filtering

    // Event when items are successfully retrieved
    results.onsuccess = (event) => {
      let allItems = event.target.result;
      let filteredItems = allItems.filter((item) => {
        let isMatch = true;

        // Check if item matches the filter criteria for year, month, and category
        if (filterObject.year != 0 && item.year != filterObject.year) {
          isMatch = false;
        }

        if (filterObject.month != 0 && item.month != filterObject.month) {
          isMatch = false;
        }

        if (
          filterObject.category != 0 && item.category != filterObject.category
        ) {
          isMatch = false;
        }

        return isMatch; // Return true if the item matches all criteria
      });

      res(filteredItems); // Resolve with the filtered items
    };

    // Handle error when retrieving items
    results.onerror = (event) => {
      console.error("Error retrieving items for filter:", event);
      rej([]); // Reject with an empty array
    };
  });
};

// An alternative version of the filtering function
idb.getCaloriesDueFilterV2 = async (filterObject) => {
  return new Promise((res, rej) => {
    const transaction = idb.db.transaction("items", "readonly");
    const store = transaction.objectStore("items");
    const results = store.getAll();

    // Event when items are successfully retrieved
    results.onsuccess = (event) => {
      let allItems = event.target.result;
      const allKeys = Object.keys(filterObject);

      // Filter items based on each filter key
      allKeys.forEach((key) => {
        allItems = idb.filterListDueTerm(allItems, filterObject[key], key);
      });

      res(allItems); // Resolve with the filtered items
    };
  });
};
