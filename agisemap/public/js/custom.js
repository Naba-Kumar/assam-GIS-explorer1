

const menuToggle = document.querySelector('.menu_sidebar_container-toggle');
const menu = document.querySelector('.menu_sidebar_container');

menuToggle.addEventListener('click', () => {
    menu.classList.toggle('active');
    let navmenuOpen = document.getElementById("menu_open")
    let navmenuClose = document.getElementById("menu_close")
    
    if(window.getComputedStyle(navmenuOpen).display==='block'){
        navmenuOpen.style.display='none'
        navmenuClose.style.display='block'
        console.log(navmenuOpen.style.display)
        console.log(navmenuClose.style.display)

    }else{
        navmenuOpen.style.display='block'
        navmenuClose.style.display='none'
        console.log(navmenuOpen.style.display)
        console.log(navmenuClose.style.display)

    }

});


// popup
document.getElementById('info-toggle').addEventListener('click', function(){
  document.getElementById('info').style.display='none';
})
// pop up

function fullscreen_click(){
    let fullscrIn= document.getElementById("fullscreen_in");
    let fullscrOut= document.getElementById("fullscreen_out");

    
    console.log(window.getComputedStyle(fullscrIn).display)
    if(window.getComputedStyle(fullscrIn).display==='block'){
        fullscrIn.style.display='none'
        fullscrOut.style.display='block'

    }else{
        fullscrIn.style.display='block'
        fullscrOut.style.display='none'

    }
}


function display_toggle(id) {
    // Get the element with the specified ID
    const clickedSubMenu = document.getElementById(id);
  
    // Get all existing sub-menus
    const subMenus = document.querySelectorAll('.sidebar_items ul.show');
  
    // Close all open sub-menus except the clicked one
    subMenus.forEach(subMenu => {
      if (subMenu !== clickedSubMenu) {
        subMenu.classList.remove('show');  //close others
      }
    });
  
    // Toggle the clicked sub-menu's visibility
    clickedSubMenu.classList.toggle('show');       //display-hide toggle
  }
  
  // Add a click event listener to the entire document
  document.addEventListener('click', function(event) {
    // Check if the click target is not within the sidebar or any sub-menu
    if (!event.target.closest('.sidebar_items, .sidebar_items ul')) {
      // Close all open sub-menus
      const openSubMenus = document.querySelectorAll('.sidebar_items ul.show');
      openSubMenus.forEach(subMenu => {
        subMenu.classList.remove('show');   //clicked out side
      });
    }
  });
  


function display_toggle_block(id) {
  // Get the element with the specified ID
  const clickedSubMenu = document.getElementById(id);

  // Get all existing sub-menus
  const subMenus = document.querySelectorAll('.side_menu_container_optins .side_menu_cat2.show');

  // Close all open sub-menus except the clicked one
  subMenus.forEach(subMenu => {
    if (subMenu !== clickedSubMenu) {
      subMenu.classList.remove('show');  //close others
    }
  });

  // Toggle the clicked sub-menu's visibility
  clickedSubMenu.classList.toggle('show');       //display-hide toggle
}

function display_toggle_block_adminState(id) {
  // Get the element with the specified ID
  const clickedSubMenu = document.getElementById(id);

  // Get all existing sub-menus
  const subMenus = document.querySelectorAll('.side_menu_container_optins .side_menu_cat3.show');

  // Close all open sub-menus except the clicked one
  subMenus.forEach(subMenu => {
    if (subMenu !== clickedSubMenu) {
      subMenu.classList.remove('show');  //close others
    }
  });

  // Toggle the clicked sub-menu's visibility
  clickedSubMenu.classList.toggle('show');       //display-hide toggle
}



// Add an event listener to the form to prevent click propagation
document.getElementById('filterForm').addEventListener('click', function(event) {
  event.stopPropagation(); // Stop the click event from propagating to the parent elements
});



// Add an event listener to the form to prevent click propagation
document.getElementById('filterFormVillage').addEventListener('click', function(event) {
  event.stopPropagation(); // Stop the click event from propagating to the parent elements
});


document.getElementById('printform').addEventListener('click', function(event) {
  event.stopPropagation(); // Stop the click event from propagating to the parent elements
});

// Function to toggle the side popup
function display_toggle_side_Popup(id) {
  // Get the element with the specified ID
  const clickedSubMenu = document.getElementById(id);

  // Get all existing sub-menus
  const subMenus = document.querySelectorAll('.sidebar_items .side_menu_popup.show');

  // Close all open sub-menus except the clicked one
  subMenus.forEach(subMenu => {
    if (subMenu !== clickedSubMenu) {
      subMenu.classList.remove('show'); // Close others
    }
  });

  // Toggle the clicked baselayer-menu's visibility
  clickedSubMenu.classList.toggle('show'); // Toggle display
}




// Function to toggle the display of the ul

document.addEventListener("DOMContentLoaded", function () {
  const baseLayerContainer = document.getElementById("base_layer_container");
  const baseLayerList = document.getElementById("base_layer_menu");
  const baseLayerIcon = document.getElementById("base_layer_container_icon");

  // Toggle the display of the base layer list when the icon is clicked
  baseLayerIcon.addEventListener("click", function () {
      baseLayerList.classList.toggle("show");
  });

  // Hide the base layer list when clicking outside of it
  document.addEventListener("click", function (event) {
      if (!baseLayerContainer.contains(event.target)) {
          baseLayerList.classList.remove("show");
      }
  });
});


// 
// assam select

document.addEventListener("DOMContentLoaded", async function () {


  // Function to populate the district dropdown
  function populateAssamDistricts(districts) {
    const districtSelect = document.getElementById('assam-district');
    districtSelect.innerHTML = '<option value="">Select District</option>';
    districts.forEach(district => {
      const option = document.createElement('option');
      option.value = district.toLowerCase().replace(/\s+/g, '-');
      option.textContent = district;
      districtSelect.appendChild(option);
    });
  }
  const assamDist = await fetchJSON('./jsons/assamdist.json')
  
  // Event listener for state selection
  document.getElementById('assam-state').addEventListener('change', async function () {
    const selectedState = this.value;
    if (selectedState === 'assam') {
      populateAssamDistricts(assamDist.districts);
    } else {
      document.getElementById('assam-district').innerHTML = '<option value="">Select District</option>';
    }
  });
  
  // Initial population of districts if Assam is preselected
  if (document.getElementById('assam-state').value === 'assam') {
    populateAssamDistricts(assamDist.districts);
  }
  
  function display_toggle_block(id) {
    const element = document.getElementById(id);
    if (element.style.display === "none" || element.style.display === "") {
      element.style.display = "block";
    } else {
      element.style.display = "none";
    }
  
  }
  })


// --------------------------------------------------------
// Layer select

async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('There was a problem with your fetch operation:', error);
  }
}

// Function to populate the state dropdown
async function populateStates() {
  const jsonData = await fetchJSON('./jsons/states-and-districts.json');
  const stateSelect = document.getElementById("state");
  jsonData.states.forEach(stateData => {
    const option = document.createElement("option");
    option.text = stateData.state;
    option.value = stateData.state;
    stateSelect.add(option);
  });
}

// Function to populate the district dropdown based on the selected state
async function populateDistricts() {
  const jsonData = await fetchJSON('./jsons/states-and-districts.json');
  const stateSelect = document.getElementById("state");
  const districtSelect = document.getElementById("district");
  const selectedState = stateSelect.value;
  districtSelect.innerHTML = "<option value=''>Select District</option>"; // Clear previous options

  if (selectedState) {
    const selectedStateData = jsonData.states.find(state => state.state === selectedState);
    if (selectedStateData) {
      selectedStateData.districts.forEach(district => {
        const option = document.createElement("option");
        option.text = district;
        option.value = district;
        districtSelect.add(option);
      });
    }
  }
}

// Attach event listeners
document.getElementById("state").addEventListener("change", populateDistricts);

// Populate states when the page loads
populateStates();

















// // Function to populate the state dropdown
// async function populateVillageCircle() {
//   const jsonData = await fetchJSON('./states-and-districts.json');
//   const districtSelect = document.getElementById("village-dist");
//   jsonData.states.forEach( districtData => {
//     const option = document.createElement("option");
//     option.text = districtData.state;
//     option.value =  districtData.state;
//     districtSelect.add(option);
//   });
// }

// // Function to populate the state dropdown
// async function populateVillageDistrict() {
//   const jsonData = await fetchJSON('./states-and-districts.json');
//   const circleselect = document.getElementById("village-circle");
//   jsonData.states.forEach(circleData => {
//     const option = document.createElement("option");
//     option.text = circleData.state;
//     option.value = circleData.state;
//     circleselect.add(option);
//   });
// }



// // Function to populate the district dropdown based on the selected state
// async function populateVillageVillage() {
//   const jsonData = await fetchJSON('./states-and-districts.json');
//   const stateSelect = document.getElementById("state");
//   const districtSelect = document.getElementById("district");
//   const selectedState = stateSelect.value;
//   districtSelect.innerHTML = "<option value=''>Select District</option>"; // Clear previous options

//   if (selectedState) {
//     const selectedStateData = jsonData.states.find(state => state.state === selectedState);
//     if (selectedStateData) {
//       selectedStateData.districts.forEach(district => {
//         const option = document.createElement("option");
//         option.text = district;
//         option.value = district;
//         districtSelect.add(option);
//       });
//     }
//   }
// }

// // Attach event listeners
// document.getElementById("state").addEventListener("change", populateDistricts);

// // Populate states when the page loads
// populateStates();











document.addEventListener('DOMContentLoaded', function () {
  const districtSelect = document.getElementById('village-dist');
  const circleSelect = document.getElementById('village-circle');
  const villageSelect = document.getElementById('village-village');

  // Fetch the JSON file containing the district, circle, village data
  fetch('./jsons/district_circle_village.json')
    .then(response => response.json())
    .then(data => {
      populateDistricts(data);
      
      districtSelect.addEventListener('change', () => {
        populateCircles(data, districtSelect.value);
        villageSelect.innerHTML = '<option value="">Select Village</option>'; // Reset villages
        villageSelect.disabled = true; // Disable village select until a circle is selected
      });

      circleSelect.addEventListener('change', () => {
        populateVillages(data, districtSelect.value, circleSelect.value);
      });
    })
    .catch(error => console.error('Error fetching data:', error));

  function populateDistricts(data) {
    data.district.forEach(district => {
      const option = document.createElement('option');
      option.value = district.district;
      option.textContent = district.district;
      districtSelect.appendChild(option);
    });
  }

  function populateCircles(data, selectedDistrict) {
    circleSelect.innerHTML = '<option value="">Select Circle</option>'; // Reset circles
    villageSelect.innerHTML = '<option value="">Select Village</option>'; // Reset villages
    villageSelect.disabled = true; // Disable village select until a circle is selected

    const district = data.district.find(d => d.district === selectedDistrict);
    if (district) {
      district.circle.forEach(circle => {
        const option = document.createElement('option');
        option.value = circle.circle;
        option.textContent = circle.circle;
        circleSelect.appendChild(option);
      });
      circleSelect.disabled = false; // Enable circle select
    } else {
      circleSelect.disabled = true; // Disable circle select if no district is selected
    }
  }

  function populateVillages(data, selectedDistrict, selectedCircle) {
    villageSelect.innerHTML = '<option value="">Select Village</option>'; // Reset villages

    const district = data.district.find(d => d.district === selectedDistrict);
    if (district) {
      const circle = district.circle.find(c => c.circle === selectedCircle);
      if (circle) {
        circle.village.forEach(village => {
          const option = document.createElement('option');
          option.value = village;
          option.textContent = village;
          villageSelect.appendChild(option);
        });
        villageSelect.disabled = false; // Enable village select
      } else {
        villageSelect.disabled = true; // Disable village select if no circle is selected
      }
    }
  }
});



document.addEventListener('DOMContentLoaded', function () {
  const districtSelectSSA = document.getElementById('ssa-dist');
  const blockSelectSSA = document.getElementById('ssa-circle');
  const villageSelectSSA = document.getElementById('ssa-village');
  const schoolSelectSSA = document.getElementById('ssa-school');

  // Fetch the JSON file containing the district, block, village, and school data
  fetch('./jsons/ssa2022list.json')
    .then(response => response.json())
    .then(data => {
      populateDistrictsSSA(data);
      
      districtSelectSSA.addEventListener('change', () => {
        populateBlocksSSA(data, districtSelectSSA.value);
        villageSelectSSA.innerHTML = '<option value="">Select Village</option>'; // Reset villages
        villageSelectSSA.disabled = true; // Disable village select until a block is selected
        schoolSelectSSA.innerHTML = '<option value="">Select School</option>'; // Reset schools
        schoolSelectSSA.disabled = true; // Disable school select until a village is selected
      });

      blockSelectSSA.addEventListener('change', () => {
        populateVillagesSSA(data, districtSelectSSA.value, blockSelectSSA.value);
        schoolSelectSSA.innerHTML = '<option value="">Select School</option>'; // Reset schools
        schoolSelectSSA.disabled = true; // Disable school select until a village is selected
      });

      villageSelectSSA.addEventListener('change', () => {
        populateSchoolsSSA(data, districtSelectSSA.value, blockSelectSSA.value, villageSelectSSA.value);
      });
    })
    .catch(error => console.error('Error fetching data:', error));

  function populateDistrictsSSA(data) {
    data.district.forEach(district => {
      const option = document.createElement('option');
      option.value = district.district;
      option.textContent = district.district;
      districtSelectSSA.appendChild(option);
    });
  }

  function populateBlocksSSA(data, selectedDistrict) {
    blockSelectSSA.innerHTML = '<option value="">Select Block</option>'; // Reset blocks
    villageSelectSSA.innerHTML = '<option value="">Select Village</option>'; // Reset villages
    villageSelectSSA.disabled = true; // Disable village select until a block is selected
    schoolSelectSSA.innerHTML = '<option value="">Select School</option>'; // Reset schools
    schoolSelectSSA.disabled = true; // Disable school select until a village is selected

    const district = data.district.find(d => d.district === selectedDistrict);
    if (district) {
      district.block.forEach(block => {
        const option = document.createElement('option');
        option.value = block.block;
        option.textContent = block.block;
        blockSelectSSA.appendChild(option);
      });
      blockSelectSSA.disabled = false; // Enable block select
    } else {
      blockSelectSSA.disabled = true; // Disable block select if no district is selected
    }
  }

  function populateVillagesSSA(data, selectedDistrict, selectedBlock) {
    villageSelectSSA.innerHTML = '<option value="">Select Village</option>'; // Reset villages
    schoolSelectSSA.innerHTML = '<option value="">Select School</option>'; // Reset schools
    schoolSelectSSA.disabled = true; // Disable school select until a village is selected

    const district = data.district.find(d => d.district === selectedDistrict);
    if (district) {
      const block = district.block.find(b => b.block === selectedBlock);
      if (block) {
        block.village.forEach(village => {
          const option = document.createElement('option');
          option.value = village.village;
          option.textContent = village.village;
          villageSelectSSA.appendChild(option);
        });
        villageSelectSSA.disabled = false; // Enable village select
      } else {
        villageSelectSSA.disabled = true; // Disable village select if no block is selected
      }
    }
  }

  function populateSchoolsSSA(data, selectedDistrict, selectedBlock, selectedVillage) {
    schoolSelectSSA.innerHTML = '<option value="">Select School</option>'; // Reset schools

    const district = data.district.find(d => d.district === selectedDistrict);
    if (district) {
      const block = district.block.find(b => b.block === selectedBlock);
      if (block) {
        const village = block.village.find(v => v.village === selectedVillage);
        if (village) {
          village.school.forEach(school => {
            const option = document.createElement('option');
            option.value = school;
            option.textContent = school;
            schoolSelectSSA.appendChild(option);
          });
          schoolSelectSSA.disabled = false; // Enable school select
        } else {
          schoolSelectSSA.disabled = true; // Disable school select if no village is selected
        }
      }
    }
  }
});



function display_toggle_side_Popup(id) {
  const element = document.getElementById(id);
  if (element.style.display === "none") {
    element.style.display = "block";
  } else {
    element.style.display = "none";
  }
}












const checkbox = document.getElementById("stateboundary");
checkbox.addEventListener('change', function(event) {
  // console.log(checkbox.addEventListener);
  console.log("Checkbox evnt listner");
});


// Function to activate menu option
function activateOption(element) {
  var menuItems = document.querySelectorAll('#base_layer_menu li');
  
  // Remove 'active' class from all menu items
  menuItems.forEach(function(item) {
      item.classList.remove('active');
  });

  // Add 'active' class to the clicked menu item
  element.classList.add('active');
}

function clearLocation() {
  // Get the input element
  var input = document.getElementById("locationInput");

  // Clear the input field
  input.value = "";
}


// Function to activate menu option
function activateOption(element) {
  var menuItems = document.querySelectorAll('#base_layer_menu li');
 
  // Remove 'active' class from all menu items
  menuItems.forEach(function(item) {
      item.classList.remove('active');
  });

  // Add 'active' class to the clicked menu item
  element.classList.add('active');
}

 
