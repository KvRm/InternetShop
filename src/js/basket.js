let basketList = getFromLocalStorage('productsToBasket');
const productsPlace = document.getElementById('addBasket');
function setToLocalStorage(name, data) {
   localStorage.setItem(''+name,JSON.stringify(data))
}
function getFromLocalStorage(name) {
   if (localStorage.getItem(''+name))
      return JSON.parse(localStorage.getItem(''+name));
   return undefined;
}
function renderBadge() {
   let badge = document.querySelector('.badge');
   if (basketList.length > 0)
      badge.innerHTML = basketList.length;
   else 
      badge.innerHTML = '';
}
function setFunctionToDeleteButton(i) {
   let btn =document.querySelector(`.d-${i}`);
   btn.addEventListener('click', () => {
      basketList.splice(i,1);
      setToLocalStorage('productsToBasket', basketList);
      renderBadge();
      renderBasket();
   })
}
const renderProduct = (i) => {
   productsPlace.innerHTML += `
   <div class="card basket-card col-5" id="card-${i}">
      <div class="card-body">
      <h5 class="card-title">${basketList[i].title}</h5>
      <img src="${basketList[i].photo}" class="basket-card-img" alt="...">
      <p class="product-price">Цена: ${basketList[i].price} руб.</p>
      <button class="d-${i}" id="delete-product">Удалить</button>
      <button id="buy-product">Купить</button>
      </div>
   </div>`;
   setTimeout(() => {
      setFunctionToDeleteButton(i)
   }, 1);
}
function renderBasket() {
   productsPlace.innerHTML = '';
   for (let i=0;i<basketList.length;i++) {
      renderProduct(i);
   }
   renderBadge();
}
renderBasket();