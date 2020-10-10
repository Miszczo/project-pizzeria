import {select, templates} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';

export class Product {
  constructor(id, data) {
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

    // console.log('new Product', thisProduct);
  }

  renderInMenu() {
    const thisProduct = this;

    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);

    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);

    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }

  getElements() {
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(
      select.menuProduct.clickable
    );
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(
      select.menuProduct.amountWidget);
    thisProduct.imageWrapper = thisProduct.element.querySelector(
      select.menuProduct.imageWrapper
    );
    thisProduct.form = thisProduct.element.querySelector(
      select.menuProduct.form
    );
    thisProduct.formInputs = thisProduct.form.querySelectorAll(
      select.all.formInputs
    );
    thisProduct.cartButton = thisProduct.element.querySelector(
      select.menuProduct.cartButton
    );
    thisProduct.priceElem = thisProduct.element.querySelector(
      select.menuProduct.priceElem
    );
  }

  initAccordion() {
    const thisProduct = this;
    // console.log(thisProduct);

    /* START: click event listener to trigger */
    thisProduct.accordionTrigger.addEventListener('click', function () {
      // console.log('clicked');

      /* prevent default action for event */
      event.preventDefault();

      /* toggle active class on element of thisProduct */
      thisProduct.element.classList.toggle('active');

      /* find all active products */
      const activeProducts = document.querySelectorAll('.product.active');

      /* START LOOP: for each active product */
      for (let activeProduct of activeProducts) {
        /* START: if the active product isn't the element of thisProduct */
        if (activeProduct != thisProduct.element) {
          /* remove class active for the active product */
          activeProduct.classList.remove('active');

          /* END: if the active product isn't the element of thisProduct */
        }
        /* END LOOP: for each active product */
      }
      /* END: click event listener to trigger */
    });
  }

  initOrderForm() {
    const thisProduct = this;
    // console.log('initOrderForm');

    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder() {
    const thisProduct = this;
    // console.log('processOrder');

    const formData = utils.serializeFormToObject(thisProduct.form);
    // console.log('formData', formData);
    thisProduct.params = {};
    let price = thisProduct.data.price;
    // console.log(price);

    /* START LOOP: for each paramId in thisProduct.data.params*/
    for (let paramId in thisProduct.data.params) {
      // console.log(paramId);
      /* save the element in thisProduct.data.params with key paramId as const param */
      const param = thisProduct.data.params[paramId];
      // console.log (param);

      /* START LOOP: for each optionId in param.options */
      for (let optionId in param.options) {
        // console.log(optionId);
        /* save the element in param.options with key optionId as const option */
        const option = param.options[optionId];

        /* find selected options */

        const optionSelected =
          formData.hasOwnProperty(paramId) &&
          formData[paramId].indexOf(optionId) > -1;
        // console.log(optionSelected);

        /* START IF: if option is selected and option is not default */
        if (optionSelected && !option.default) {
          /* add price of option to variable price */
          price += option.price;

          /* END IF: if option is selected and option is not default */
          /* START ELSE IF: if option is not selected and option is default */
        } else if (!optionSelected && option.default) {
          /* deduct price of option from price */
          price -= option.price;
          /* END ELSE IF: if option is not selected and option is default */
        }
        /* find all elements */
        const foundImages = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);
        // console.log(foundImages);
        /* IF option check - all images get class from classNames.menuProduct.imageVisible*/
        if (optionSelected) {
          if(!thisProduct.params[paramId]){
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            };
          }
          thisProduct.params[paramId].options[optionId] = option.label;
          for(let foundImage of foundImages) {
            foundImage.classList.add('active');
            // console.log(foundImage);
          }
          /* ELSE all images for this option should lost class from classNames.menuProduct.imageVisible */
        } else {
          for (let foundImage of foundImages){
            foundImage.classList.remove('active');
            console.log(foundImage);
          }
        }
        /* END LOOP: for each optionId in param.options */
      }
      /* END LOOP: for each paramId in thisProduct.data.params */
    }
    /* multiply price by amount */
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    /* insert price into thisProduct.priceElem */

    thisProduct.priceElem.innerHTML = thisProduct.price;
    console.log(thisProduct.params);
  }

  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

    thisProduct.amountWidgetElem.addEventListener('updated', function() {
      thisProduct.processOrder();
    });

  }

  addToCart(){
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name ;
    thisProduct.amount= thisProduct.amountWidget.value;

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);

  }
}
