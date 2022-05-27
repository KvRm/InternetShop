"use strict" 

window.onload = async function() {
   const categories_URL = 'https://dh.cubicle.53xapps.com/categories';
   const products_URL = 'https://dh.cubicle.53xapps.com/products';

   const productsPlace = document.getElementById('card-place');
   // Получение объектов в массивы продукты и категории
   let productsList;
   let categoriesList;
   let ShowedElmsCount;
   let productsToBasket = [];

   const getProductsInBasket = () => {
      if (getFromLocalStorage('productsToBasket')) {
         productsToBasket = getFromLocalStorage('productsToBasket');
         if (productsToBasket.length>0)
            document.querySelector('.badge').innerHTML = productsToBasket.length;
      }
   }
   getProductsInBasket();

   // получение данных
   await sendRequest();

   async function sendRequest(){
      const getData = async (URL) => {
         let response = await fetch(URL);
         let data = await response.json();
         return data;
      }
      productsList = await getData(products_URL);
      categoriesList = await getData(categories_URL);
      setToLocalStorage('productsList',productsList);
   }
   function setToLocalStorage(name, data) {
      localStorage.setItem(''+name,JSON.stringify(data))
   }
   function getFromLocalStorage(name) {
      if (localStorage.getItem(''+name))
         return JSON.parse(localStorage.getItem(''+name));
      return undefined;
   }
   function renderProduct(i) {
      productsPlace.innerHTML +=
         `<div class="card col-4">
         <div class="card-body">
         <h5 class="card-title">${productsList[i].title}</h5>
         <small class="description">${productsList[i].description}</small>
         <img src="${productsList[i].photo}" class="card-img" alt="img">
         <p class="product-price">Цена: ${productsList[i].price} руб.</p>
         <button class="get-product" id="addToBasket-${productsList[i].id}">Добавить в корзину</button>
         </div>
         </div>`;
      setTimeout(() => {
         let btn = document.getElementById(`addToBasket-${productsList[i].id}`);
         btn.addEventListener('click', () => {
            productsToBasket.push(productsList[i]);
            console.log(productsToBasket);
            document.querySelector('.badge').innerHTML = productsToBasket.length;
            setToLocalStorage('productsToBasket', productsToBasket);
         }, 1);
      })
   }
   const renderNineProducts = async () => {
      if (!productsList[0]) return;
      let x;
      if (!ShowedElmsCount) x = 0;
      else x = ShowedElmsCount;
      for (let i=0;i<9 && x < productsList.length;i++, x++) {
         renderProduct(x);
      }
   }
   const renderProductsOnload = async () => {
      if (!productsList[0]) return;
      if (!getFromLocalStorage('ShowedElmsCount')) {
         ShowedElmsCount = 9;
         for (let i=0;i<ShowedElmsCount;i++) {
            renderProduct(i);
         }
         setToLocalStorage('ShowedElmsCount',ShowedElmsCount);
      }
      else {
         ShowedElmsCount = Number(getFromLocalStorage('ShowedElmsCount'));
         for (let i=0;i<ShowedElmsCount;i++) {
            renderProduct(i);
         }
      };
      if (ShowedElmsCount < productsList.length) createMoreProductsElement();
   }
   const createMoreProductsElement = () => {
      let btnPlace = document.querySelector('.more-products-container');
      btnPlace.innerHTML = `
      <div class="more-products">
         <p>Показать еще</p>
      </div>`;
      btnPlace.addEventListener('click', function() {
         renderNineProducts();
         if (ShowedElmsCount+9 > productsList.length) ShowedElmsCount = productsList.length;
         else ShowedElmsCount +=9;
         setToLocalStorage('ShowedElmsCount',ShowedElmsCount);
         if (ShowedElmsCount == productsList.length) btnPlace.innerHTML = '';
      })
   }
   const renderCatalog = async () => {
      if (!categoriesList) return;
      const catalogList = document.querySelector('.catalog-list-group'); 
      for (let i=0; i<categoriesList.length;i++) {
         catalogList.innerHTML += 
         `<li class="list-group-item">
            <label for="c-${categoriesList[i].id}">
               <input type="checkbox" id="c-${categoriesList[i].id}" class="checkboxCategory">${categoriesList[i].title}</input>
            </label>
         </li>`
      }
      const checkboxes = document.querySelectorAll('.checkboxCategory');
      for (let checkbox of checkboxes) {
         checkbox.setAttribute('checked','true');
      }
   }
   //функционал девевле/дороже
   const addMinMaxPriceSort = () => {
      const min = document.querySelector('.min');
      const max = document.querySelector('.max');
      min.addEventListener('click', () => {
         productsList.sort(function (a, b) {
            if (a.price > b.price) {
               return 1;
            }
            if (a.price < b.price) {
               return -1;
            }
            return 0;
            });
         productsPlace.innerHTML = '';
         ShowedElmsCount = 0;
         renderNineProducts();
         createMoreProductsElement();
         ShowedElmsCount = 9;
         setToLocalStorage('ShowedElmsCount',ShowedElmsCount);
      });
      max.addEventListener('click', () => {
         productsList.sort(function (a, b) {
            if (a.price < b.price) {
               return 1;
            }
            if (a.price > b.price) {
               return -1;
            }
            return 0;
            });
         productsPlace.innerHTML = '';
         ShowedElmsCount = 0;
         renderNineProducts();
         createMoreProductsElement();
         ShowedElmsCount = 9;
         setToLocalStorage('ShowedElmsCount',ShowedElmsCount);
      });
   }
   const addSearchProducts = () => {
      let btnSearch = document.querySelector('.btn-search');
      btnSearch.addEventListener('click', function() {
         const value = document.getElementById('liveSearch').value.trim()
         const elasticItems = document.querySelectorAll('.card');
         const searchRegExp = new RegExp(value, 'gi');
         const moreBtn = document.querySelector('.more-products-container');
         if (value === '') {
            elasticItems.forEach((el) => {
               el.classList.remove('hide')
            })
            moreBtn.classList.remove('hide');
            return
         }
         else {
            elasticItems.forEach((el) => {
               const innerCard = el.querySelector('.card-title')
               const elementText = innerCard.textContent;
               const isContainsSearchRequest = searchRegExp.test(elementText)
               if (!isContainsSearchRequest) {
                  el.classList.add('hide')
               } else {
                  el.classList.remove('hide');
               }
               moreBtn.classList.add('hide');
            })
         }
      })
   }
   const filterProductsListByCategories = () => {
      let checkboxes = document.querySelectorAll('.checkboxCategory');
      productsList = getFromLocalStorage('productsList');
      let idOfElmsToHide = [];
      for (let i=0;i<checkboxes.length;i++) {
         if (!checkboxes[i].checked)
            idOfElmsToHide.push(Number(checkboxes[i].getAttribute('id').split('-')[1]));
      }
      for (let id of idOfElmsToHide) {
         for (let i=0;i<productsList.length;i++){
            if (productsList[i].category == id) {
               productsList.splice(i,1);
               i--;
            }
         }
      }
   }
   // выбор элементов из списка каталога
   document.querySelector('.categories-select').addEventListener('click', async () => {
      // console.log(productsList);
      filterProductsListByCategories();
      console.log(productsList);
      productsPlace.innerHTML = '';
      if (productsList.length > 9) ShowedElmsCount = 9;
      else ShowedElmsCount = productsList.length;
      setToLocalStorage('ShowedElmsCount',ShowedElmsCount);
      renderProductsOnload();
   });
   addMinMaxPriceSort();   
   renderCatalog()
      .then(filterProductsListByCategories())
      //загрузка продуктов в каталог
      .then(renderProductsOnload())
      //функция добавления в корзину
      //функционал поиска
      .then(addSearchProducts());
}