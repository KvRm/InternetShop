"use strict" 

const categories_URL = 'https://dh.cubicle.53xapps.com/categories';
const products_URL = 'https://dh.cubicle.53xapps.com/products';

const productsPlace = document.getElementById('card-place');
// Получение объектов в массивы продукты и категории
let productsList;
let categoriesList;
let ShowedElmsCount;
let productsToBasket = [];
const sendRequest = async () => {
   const getData = async (URL) => {
      let response = await fetch(URL);
      let data = await response.json();
      return data;
   }
   productsList = await getData(products_URL);
   categoriesList = await getData(categories_URL);
}
function getCookie(name) {
   let matches = document.cookie.match(new RegExp(
     "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
   ));
   return matches ? decodeURIComponent(matches[1]) : undefined;
}

const renderProducts = async () => {
   let x;
   if (!ShowedElmsCount) x = 0;
   else x = ShowedElmsCount;
   for (let i=0;i<9 && x < productsList.length;i++, x++) {
      productsPlace.innerHTML +=
      `<div class="card col-4">
      <div class="card-body">
      <h5 class="card-title">${productsList[x].title}</h5>
      <small class="description">${productsList[x].description}</small>
      <img src="${productsList[x].photo}" class="card-img" alt="img">
      <p class="product-price">Цена: ${productsList[x].price} руб.</p>
      <button class="get-product" id="addToBasket-${productsList[i].id}">Добавить в корзину</button>
      </div>
      </div>`
   }
}
const createMoreProductsElement = () => {
   let btnPlace = document.querySelector('.more-products-container');
   btnPlace.innerHTML = `
   <div class="more-products">
      <p>Показать еще</p>
   </div>
   `
   btnPlace.onclick = function() {
      renderProducts();
      if (ShowedElmsCount+9 > productsList.length) ShowedElmsCount = productsList.length;
      else ShowedElmsCount +=9;
      document.cookie = "ShowedElmsCount="+ShowedElmsCount;
      if (ShowedElmsCount == productsList.length) btnPlace.innerHTML = '';
   }
}
//при загрузке страницы
async function showProduts() {
   await renderProducts();
   setTimeout(() => {
      if (!getCookie('ShowedElmsCount')) {
      ShowedElmsCount = 9;
      document.cookie = "ShowedElmsCount="+ShowedElmsCount;
   }
   else {
      ShowedElmsCount = Number(getCookie('ShowedElmsCount'));
      for (let i=9;i<ShowedElmsCount;i++) {
         productsPlace.innerHTML +=
         `<div class="card col-4">
         <div class="card-body">
         <h5 class="card-title">${productsList[i].title}</h5>
         <small class="description">${productsList[i].description}</small>
         <img src="${productsList[i].photo}" class="card-img" alt="img">
         <p class="product-price">Цена: ${productsList[i].price} руб.</p>
         <button class="get-product" id="addToBasket-${productsList[i].id}">Добавить в корзину</button>
         </div>
         </div>`
      }
   };
   if (ShowedElmsCount < productsList.length) createMoreProductsElement();
   })
}
function changeProductListByCategory(id) {
   for (let i=0;i<productsList.length;i++) {
      if (productsList[i].category != id) {
         productsList.splice(i,1);
         i--;
      }
   }
   console.log(productsList);
}
// category.changeProductsByCategory = function() {
//    for (let i=0;i<productsList.length;i++) {
//       if (productsList[i].category != category.id) {
//          console.log(category.id);
//          productsList.splice(i,1);
//          i--;
//       }
//    }
//    console.log(productsList);
// }
function renderCatalog() {
   const listGroup = document.querySelector('.catalog-list-group'); 
   for (let category of categoriesList) {
      listGroup.innerHTML += 
      `<li class="list-group-item">${category.title}</li>`
   }
}
// получение данных
await sendRequest();

//функционал девевле/дороже
const min = document.querySelector('.min');
const max = document.querySelector('.max');
min.onclick = () => {
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
   renderProducts();
   createMoreProductsElement();
   ShowedElmsCount = 9;
   document.cookie = 'ShowedElmsCount='+ShowedElmsCount;
};
max.onclick = () => {
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
   renderProducts();
   createMoreProductsElement();
   ShowedElmsCount = 9;
   document.cookie = 'ShowedElmsCount='+ShowedElmsCount;
};
//загрузка продуктов в каталог
showProduts()
   .then(renderCatalog())
   // Функционал кнопки добавит в корзину
   .then(() => {
      if (!ShowedElmsCount) ShowedElmsCount = getCookie('ShowedElmsCount');
      for (let i=0;i<ShowedElmsCount;i++) {
         let id = 'addToBasket-'+productsList[i].id;
         let curItem = document.getElementById(id);
         console.log(curItem);
      }
   })
   //функционал поиска
   .then(() => {
   let btnSearch = document.querySelector('.btn-search');
   btnSearch.onclick = function() {
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
         }
   })