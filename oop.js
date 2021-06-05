class Item {
     id = '_' + Math.random().toString(36).substr(2, 9);
     checked = false;
     constructor(description, type) {
          this.description = description;
          this.type = type;
     }
}

class SpecificItem extends Item {
     constructor(description, time, type) {
          super(description, type);
          this.time = type === 'mydays'? this._convertTimeFormat(time) : this._convertDateFormat(time);
     }

     _convertTimeFormat(time) {
          const hour = Number(time.split(':')[0]);
          const minute = Number(time.split(':')[1]);
          const hourText = hour > 12? hour % 12 : hour;
     
          let minuteText;
          if(minute === 0) {
               minuteText = '00';
          }
          else if(minute < 10) {
               minuteText = `0${minute}`;
          }
          else {
               minuteText = minute;
          }
     
          return `${hourText < 10? `0${hourText}` : hourText}:${minuteText} ${hour < 12? 'am' : 'pm'}`;
     }

     _convertDateFormat(date) {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const [year, month, day] = date.split('-');
          return `${months[Number(month) - 1]} ${day}, ${year}`;
     }
}

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
const githubButton = document.querySelector('.fa-github');

class App {
     lists = [];
     mydays = [];
     schedules = [];
     items = {};
     currentSection;

     constructor() {
          this._getLocalStorage();

          categories.addEventListener('click', (e) => {
               const selectedCategory = e.target.closest('.category');
               if(!selectedCategory) return;
          
               this._selectCategory(selectedCategory);
          });
          
          sectionContainer.addEventListener('click', (e) => {
               const selectedItem = e.target.closest('.far');
               if(!selectedItem) return;
               
               const list = selectedItem.closest('.flex');
               const itemId = list.dataset.id;
               const type = list.dataset.type;
               const index = type !== 'mydays' && type !== 'schedules'? 
                    this.items[type].findIndex(el => el.id === itemId) : this[type].findIndex(el => el.id === itemId);

               if(selectedItem.className.includes('check')) {
                    selectedItem.className = selectedItem.className.replace('check', 'times');
                    selectedItem.closest('.flex').children[1].firstElementChild.classList.add('line-through');
                    
                    if(type !== 'mydays' && type !== 'schedules') {
                         this.items[type][index].checked = true;
                         localStorage.setItem('items', JSON.stringify(this.items));
                    }
                    else {
                         this[type][index].checked = true;
                         localStorage.setItem(type, JSON.stringify(this[type]));
                    }

                    return;
               }
          
               if(selectedItem.className.includes('trash')) {
                    list.remove();

                    if(type !== 'mydays' && type !== 'schedules') {
                         this.items[type].splice(index, 1);
                         localStorage.setItem('items', JSON.stringify(this.items));
                    }
                    else {
                         this[type].splice(index, 1);
                         localStorage.setItem(type, JSON.stringify(this[type]));
                    }
                    
                    return;
               }
          
               if(selectedItem.className.includes('times')) {
                    selectedItem.className = selectedItem.className.replace('times', 'check');
                    selectedItem.closest('.flex').children[1].firstElementChild.classList.remove('line-through');

                    if(type !== 'mydays' && type !== 'schedules') {
                         this.items[type][index].checked = false;
                         localStorage.setItem('items', JSON.stringify(this.items));
                    }
                    else {
                         this[type][index].checked = false;
                         localStorage.setItem(type, JSON.stringify(this[type]));
                    }

                    return;
               }
          });
          
          addListButton.addEventListener('click', () => {
               addListForm.classList.toggle('hidden');
          
               if(listIcon.className.includes('plus')) {
                    addListForm.firstElementChild.focus();
                    listIcon.className = listIcon.className.replace('plus', 'times');
                    return;
               }
          
               if(listIcon.className.includes('times')) {
                    this._resetForm();
                    return;
               }
          });
          
          addListForm.addEventListener('submit', (e) => {
               e.preventDefault();
               if(!addListForm.firstElementChild.value.trim()) return;
          
               const listName = addListForm.firstElementChild.value;
               const className = listName.toLowerCase().replaceAll(' ', '-');

               allCategories = Array.from(document.querySelectorAll('.category'));
               const sections = allCategories.map((el) => el.className.split(' ')[0]);

               if(sections.some(section => section === className)) return;

               const listObjName = this._convertCamelCase(className);
               this.items[listObjName] = [];

               const list = {className: className, listName: listName}
               this.lists.push(list);
               localStorage.setItem('lists', JSON.stringify(this.lists));

               this._renderList(list);
          
               addListForm.classList.add('hidden');
               this._resetForm();
          });

          addTaskButton.addEventListener('click', () => {
               this._showForm(addTaskForm);
          });
          
          addScheduleButton.addEventListener('click', () => {
               this._showForm(addScheduleForm);
          });
          
          submitTaskButton.addEventListener('click', (e) => {
               this._addTaskSchedule(addTaskForm, 'mydays');
          });
          
          submitScheduleButton.addEventListener('click', (e) => {
               this._addTaskSchedule(addScheduleForm, 'schedules');
          });
          
          addTaskForm.addEventListener('submit', (e) => {
               e.preventDefault();
               this._addTaskSchedule(addTaskForm, 'mydays');
          });
          
          addScheduleForm.addEventListener('submit', (e) => {
               e.preventDefault();
               this._addTaskSchedule(addScheduleForm, 'schedules');
          });
          
          cancelTaskButton.addEventListener('click', (e) => {
               this._closeForm(addTaskForm);
          });
          
          cancelScheduleButton.addEventListener('click', (e) => {
               this._closeForm(addScheduleForm);
          });
          
          sectionContainer.addEventListener('click', (e) => {
               const target = e.target.closest('.add-item-button');
               if(!target) return;
          
               this.currentSection = target.parentElement;
               dialog.classList.remove('hidden');
               addItemForm.firstElementChild.focus();
          });
          
          addItemForm.addEventListener('submit', (e) => {
               e.preventDefault();
               this._addItem();
          });

          submitItemButton.addEventListener('click', () => {
               this._addItem();
          });
          
          cancelItemButton.addEventListener('click', function() {
               addItemForm.firstElementChild.value = '';
               dialog.classList.add('hidden');
          });
          
          sectionContainer.addEventListener('click', (e) => {
               const target = e.target.closest('.delete-list-button');
               if(!target) return;
          
               if(!window.confirm("Are you sure to delete this list?")) return;
               
               const toDeleteSection = target.parentElement.parentElement;
               const toDeleteList = toDeleteSection.id;
          
               const index = this.lists.findIndex(list => list.className === toDeleteList);
               this.lists.splice(index, 1);
               delete this.items[this._convertCamelCase(toDeleteList)];
               localStorage.setItem('items', JSON.stringify(this.items));
               localStorage.setItem('lists', JSON.stringify(this.lists));

               toDeleteSection.remove();
               categories.querySelector(`.${toDeleteList}`).remove();
               this._selectCategory(allCategories[0]);
          });

          githubButton.addEventListener('click', () => {
               window.open('https://github.com/nainglinnkhant')
          })
     }

     _getLocalStorage() {
          const mydays = JSON.parse(localStorage.getItem('mydays'));
          const schedules = JSON.parse(localStorage.getItem('schedules'));
          const lists = JSON.parse(localStorage.getItem('lists'));
          const items = JSON.parse(localStorage.getItem('items'));

          if(mydays) {
               this.mydays = mydays;
               this.mydays.forEach(myday => this._renderItem(myday, addTaskForm));
          }
          if(schedules) {
               this.schedules = schedules;
               this.schedules.forEach(schedule => this._renderItem(schedule, addScheduleForm));
          }
          if(lists) {
               this.lists = lists;
               this.lists.forEach(list => this._renderList(list, true));
          }
          if(lists !== null && items !== null) {
               this.items = items;
               this.lists.forEach(list => {
                    if(this.items[this._convertCamelCase(list.className)]) {
                         this.items[this._convertCamelCase(list.className)].forEach(item => {
                              this.currentSection = document.getElementById(`${list.className}`);
                              this._renderItem(item);
                         });
                    }    
               });
          }
     }

     _convertCamelCase(listName) {
          const arr = listName.split('-');
          return arr.map((el, i) => {
               if(i === 0) return el;
               return el[0].toUpperCase() + el.slice(1);
          }).join('');
     }
     
     _selectCategory(selectedCategory) {
          allCategories = Array.from(document.querySelectorAll('.category'));
          allCategories.forEach(category => category.firstElementChild.classList.remove('active'));
          selectedCategory.firstElementChild.classList.add('active');
     
          const sections = allCategories.map((el) => el.className.split(' ')[0]);
          const selectedSection = document.getElementById(selectedCategory.className.split(' ')[0]);
     
          sections.forEach(sec => document.getElementById(sec).classList.add('hidden'));
          selectedSection.classList.remove('hidden');
     };

     _renderList(list, isInit = false) {
          const newList = `
          <li class="${list.className} category">
               <a
                    class="text-gray-600 hover:text-yellow-400 text-sm py-3 font-semibold block"
                    href="#/dashboard"
               >
                    <i class="fas fa-list-ul opacity-75 mr-2 text-sm"></i>
                    ${list.listName}
               </a>
          </li>
          `;
          categories.insertAdjacentHTML('beforeend', newList);
     
          const newSection = `
          <div id="${list.className}" class="hidden">
               <h2 class="text-lg font-semibold border-l-8 border-yellow-300 pl-4 rounded-md shadow-md bg-yellow-50 py-3">
                    ${list.listName}
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
          if(isInit) this._selectCategory(allCategories[0]);
          else this._selectCategory(document.querySelector(`.${list.className}`));
     }
     
     _resetForm() {
          addListForm.firstElementChild.value = '';
          listIcon.className = listIcon.className.replace('times', 'plus');
     };
     
     _addTaskSchedule(currentForm, type) {
          const description = currentForm.firstElementChild.value.trim();
          const time = currentForm.lastElementChild.value;
     
          if(!description || !time) return;

          const item = new SpecificItem(description, time, type);
          this[type].push(item);
          localStorage.setItem(type, JSON.stringify(this[type]));
          
          this._renderItem(item, currentForm);

          currentForm.closest('li').classList.add('hidden');
          currentForm.firstElementChild.value = '';
          currentForm.lastElementChild.value = '';
     };

     _addItem() {
          if(!addItemForm.firstElementChild.value.trim()) return;

          const listObjName = this._convertCamelCase(this.currentSection.id);
          const item = new Item(addItemForm.firstElementChild.value, listObjName);

          if(!this.items[listObjName]) this.items[listObjName] = [];
          this.items[listObjName].push(item);
          localStorage.setItem('items', JSON.stringify(this.items));

          this._renderItem(item);
     
          addItemForm.firstElementChild.value = '';
          dialog.classList.add('hidden');
     }

     _renderItem(item, currentForm = null) {
          let html = `
          <li class="flex pb-6" data-id="${item.id}" data-type="${item.type}">
               <div class="w-1/12 text-center">
                    <i class="far fa-${item.checked ? 'times' : 'check'}-circle cursor-pointer"></i>
               </div>`;
          
          if(item.type !== 'mydays' && item.type !== 'schedules') {
               html += `
               <div class="w-10/12 md:w-10/12">
                    <p class='${item.checked ? 'line-through' : ''}'>${item.description}</p>
               </div>

               <div class="w-1/12 text-center">
                    <i class="far fa-trash-alt cursor-pointer"></i>
               </div>
          </li>
          `;

               const itemContainer = this.currentSection.querySelector('ul');
               itemContainer.insertAdjacentHTML('beforeend', html);
          }

          else {
               html += `
               <div class="w-10/12 md:w-10/12 align-baseline">
                    <p class='float-left ${item.checked ? 'line-through' : ''}'>${item.description}</p>
                    <p class="float-right">${item.time}</p>
               </div>

               <div class="w-1/12 text-center">
                    <i class="far fa-trash-alt cursor-pointer"></i>
               </div>
          </li>
          `;

               currentForm.closest('li').insertAdjacentHTML('beforebegin', html);
          }
     }
     
     _showForm(currentForm) {
          const form = currentForm.closest('li');
          form.className = form.className.replace('hidden', 'flex');
          currentForm.firstElementChild.focus();
     };
     
     _closeForm(currentForm) {
          currentForm.firstElementChild.value = '';
          currentForm.lastElementChild.value = '';
     
          const form = currentForm.closest('li');
          form.className = form.className.replace('flex', 'hidden');
     };
}

const app = new App();