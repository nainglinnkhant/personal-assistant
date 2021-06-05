const categories = document.querySelector('.categories');
let allCategories = Array.from(document.querySelectorAll('.category'));
const addListButton = document.querySelector('.add-list-button');
const addListForm = document.querySelector('.add-list-form');
const listIcon = addListButton.querySelector('i');
const deleteListButton = document.querySelector('.delete-list-button');

const sectionContainer = document.querySelector('.section-container');
const addTaskButton = document.querySelector('.add-task-button');
const addScheduleButton = document.querySelector('.add-schedule-button');
const addTaskForm = document.querySelector('.add-task-form');
const addScheduleForm = document.querySelector('.add-schedule-form');
const submitTaskButton = document.querySelector('.submit-task-button');
const submitScheduleButton = document.querySelector('.submit-schedule-button');
const cancelTaskButton = document.querySelector('.cancel-task-button');
const cancelScheduleButton = document.querySelector('.cancel-schedule-button');
const addItemForm = document.querySelector('.add-item-form');
const submitItemButton = document.querySelector('.submit-item-button');
const cancelItemButton = document.querySelector('.cancel-item-button');
const dialog = document.querySelector('.dialog');

const convertTimeFormat = function(time) {
     const hour = Number(time.split(':')[0]);
     const minute = Number(time.split(':')[1]);
     const hourText = hour > 12? hour % 12 : hour;

     let minuteText;
     if(minute === 0) {
          minuteText = '00';
     }
     else if(minute < 9) {
          minuteText = `0${minute}`;
     }
     else {
          minuteText = minute;
     }

     return `${hourText < 9? `0${hourText}` : hourText}:${minuteText} ${hour < 12? 'am' : 'pm'}`;
};

const convertDateFormat = function(date) {
     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
     const [year, month, day] = date.split('-');
     return `${months[Number(month) - 1]} ${day}, ${year}`;
}

const selectCategory = function(selectedCategory) {
     allCategories = Array.from(document.querySelectorAll('.category'));
     allCategories.forEach(category => category.firstElementChild.classList.remove('active'));
     selectedCategory.firstElementChild.classList.add('active');

     const sections = allCategories.map((el) => el.className.split(' ')[0]);
     const selectedSection = document.getElementById(selectedCategory.className.split(' ')[0]);

     sections.forEach(sec => document.getElementById(sec).classList.add('hidden'));
     selectedSection.classList.remove('hidden');
};

const resetForm = function() {
     addListForm.firstElementChild.value = '';
     listIcon.className = listIcon.className.replace('times', 'plus');
};

const addItem = function(currentForm, format) {
     const description = currentForm.firstElementChild.value;
     const time = currentForm.lastElementChild.value;

     if(!description || !time) return;

     let formattedTime;
     if(format === 'time') formattedTime = convertTimeFormat(time);
     if(format === 'date') formattedTime = convertDateFormat(time);

     currentForm.closest('li').classList.add('hidden');

     currentForm.firstElementChild.value = '';
     currentForm.lastElementChild.value = '';

     const html = `
     <li class="flex pb-6">
          <div class="w-1/12 text-center">
               <i class="far fa-check-circle cursor-pointer"></i>
          </div>

          <div class="w-10/12 md:w-10/12 align-baseline">
               <p class="float-left">${description}</p>
               <p class="float-right">${formattedTime}</p>
          </div>

          <div class="w-1/12 text-center">
               <i class="far fa-trash-alt cursor-pointer"></i>
          </div>
     </li>
     `;
     currentForm.closest('li').insertAdjacentHTML('beforebegin', html);
};

const showForm = function(currentForm) {
     const form = currentForm.closest('li');
     form.className = form.className.replace('hidden', 'flex');
     currentForm.firstElementChild.focus();
};

const closeForm = function(currentForm) {
     currentForm.firstElementChild.value = '';
     currentForm.lastElementChild.value = '';

     const form = currentForm.closest('li');
     form.className = form.className.replace('flex', 'hidden');
};

categories.addEventListener('click', function(e) {
     const selectedCategory = e.target.closest('.category');
     if(!selectedCategory) return;

     selectCategory(selectedCategory);
});

sectionContainer.addEventListener('click', function(e) {
     const selectedItem = e.target.closest('.far');
     if(!selectedItem) return;

     if(selectedItem.className.includes('check')) {
          selectedItem.className = selectedItem.className.replace('check', 'times');
          selectedItem.closest('.flex').children[1].firstElementChild.classList.add('line-through');
          return;
     }

     if(selectedItem.className.includes('trash')) {
          selectedItem.closest('.flex').remove();
          return;
     }

     if(selectedItem.className.includes('times')) {
          selectedItem.className = selectedItem.className.replace('times', 'check');
          selectedItem.closest('.flex').children[1].firstElementChild.classList.remove('line-through');
          return;
     }
});

addListButton.addEventListener('click', function() {
     addListForm.classList.toggle('hidden');

     if(listIcon.className.includes('plus')) {
          addListForm.firstElementChild.focus();
          listIcon.className = listIcon.className.replace('plus', 'times');
          return;
     }

     if(listIcon.className.includes('times')) {
          resetForm();
          return;
     }
});

addListForm.addEventListener('submit', function(e) {
     e.preventDefault();
     if(!addListForm.firstElementChild.value) return;

     const listName = addListForm.firstElementChild.value;
     const className = listName.toLowerCase().replaceAll(' ', '-');

     const newList = `
     <li class="${className} category">
          <a
               class="text-gray-600 hover:text-yellow-400 text-sm py-3 font-semibold block"
               href="#/dashboard"
          >
               <i class="fas fa-list-ul opacity-75 mr-2 text-sm"></i>
               ${listName}
          </a>
     </li>
     `;
     categories.insertAdjacentHTML('beforeend', newList);

     const newSection = `
     <div id="${className}" class="hidden">
          <h2 class="text-lg font-semibold border-l-8 border-yellow-300 pl-4 rounded-md shadow-md bg-yellow-50 py-3">
               ${listName}
          </h2>

          <ul class="text-sm mt-8 mx-2">
          </ul>

          <button class="add-item-button text-sm text-gray-700 mx-2 hover:text-yellow-500 focus:outline-none">
               <i class="fas fa-plus text-xs mr-1"></i>
               Add item
          </button>

          <div class="mt-16 flex justify-center">
               <button class="delete-list-button bg-red-100 text-sm text-red-500 border border-red-400 block w-28 font-medium p-1 rounded-md focus:outline-none">
                    Delete this list
               </button>
          </div>
     </div>
     `;

     sectionContainer.insertAdjacentHTML('beforeend', newSection);
     selectCategory(document.querySelector(`.${className}`));

     addListForm.classList.add('hidden');
     resetForm();
});

addTaskButton.addEventListener('click', function() {
     showForm(addTaskForm);
});

addScheduleButton.addEventListener('click', function() {
     showForm(addScheduleForm);
});

submitTaskButton.addEventListener('click', function(e) {
     addItem(addTaskForm, 'time');
});

submitScheduleButton.addEventListener('click', function(e) {
     addItem(addScheduleForm, 'date');
});

addTaskForm.addEventListener('submit', function(e) {
     e.preventDefault();
     addItem(addTaskForm, 'time');
});

addScheduleForm.addEventListener('submit', function(e) {
     e.preventDefault();
     addItem(addScheduleForm, 'date');
});

cancelTaskButton.addEventListener('click', function(e) {
     closeForm(addTaskForm);
});

cancelScheduleButton.addEventListener('click', function(e) {
     closeForm(addScheduleForm);
});

let currentSection;

sectionContainer.addEventListener('click', function(e) {
     const target = e.target.closest('.add-item-button')
     if(!target) return;

     currentSection = target.parentElement;
     dialog.classList.remove('hidden');
     addItemForm.focus();
});

submitItemButton.addEventListener('click', function() {
     if(!addItemForm.value) return;

     const itemContainer = currentSection.querySelector('ul');
     const html = `
     <li class="flex pb-6">
          <div class="w-1/12 text-center">
               <i class="far fa-check-circle cursor-pointer"></i>
          </div>

          <div class="w-10/12 md:w-10/12">
               <p>${addItemForm.value}</p>
          </div>

          <div class="w-1/12 text-center">
               <i class="far fa-trash-alt cursor-pointer"></i>
          </div>
     </li>
     `;
     itemContainer.insertAdjacentHTML('beforeend', html);

     addItemForm.value = '';
     dialog.classList.add('hidden');
});

cancelItemButton.addEventListener('click', function() {
     addItemForm.value = '';
     dialog.classList.add('hidden');
});

sectionContainer.addEventListener('click', function(e) {
     const target = e.target.closest('.delete-list-button');
     if(!target) return;

     if(!window.confirm("Are you sure to delete this list?")) return;
     
     const toDeleteSection = target.parentElement.parentElement;
     const toDeleteList = toDeleteSection.id;

     toDeleteSection.remove();
     categories.querySelector(`.${toDeleteList}`).remove();
     selectCategory(allCategories[0]);
});

