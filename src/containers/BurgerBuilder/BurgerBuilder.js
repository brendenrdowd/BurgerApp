import React, { Component } from 'react';

import Aux from '../../HOC/Auxiliary';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Axios from '../../axios-orders';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../HOC/withErrorHandler/withErrorHandler';

const INGREDIENT_PRICES = {
    salad:0.5,
    cheese:0.25,
    meat:1.50,
    bacon:0.75
}

class BurgerBuilder extends Component{
    state = {
        ingredients:null,
        totalPrice:4,
        purchaseable:false,
        purchasing:false,
        loading:false,
        error:false
    }

    componentDidMount(){
        Axios.get('https://react-burger-86673.firebaseio.com/ingredients.json')
            .then(response =>{
                this.setState({ingredients:response.data})
            })
            .catch(error => this.setState({error:true}));
    }

    purchaseHandler = () =>{
        this.setState({purchasing:true});
    }

    purchaseCancelHandler = () =>{
        this.setState({purchasing:false});
    }

    purchaseContinueHandler = () =>{
        this.setState({loading:true})
        const order = {
            ingredients:this.state.ingredients,
            price:this.state.totalPrice, //would actually calc price on server to avoid manipulation
            customer:{
                name:'brenden',
                address:{
                    street:'12345',
                    zipCode:'12345',
                    country:'US'
                },
                email:'test@test.com',
            },
            deliveryMethod:'fastest'
        }
        Axios.post('/orders.json',order)
            .then(response => this.setState({loading:false,purchasing:false}))
            .catch(error => this.setState({loading:false,purchasing:false}));
    }

    updatedPurchaseState(ingredients){
        const sum = Object.keys(ingredients)
            .map(igKey =>{
                return ingredients[igKey];
            })
            .reduce((sum,el)=>{
                return sum + el;
            },0);
        this.setState({purchaseable: sum > 0});
    }

    addIngredientHandler = (type) =>{
        const oldCount = this.state.ingredients[type];
        const updatedCount = oldCount + 1;
        const updatedIngredients ={
            ...this.state.ingredients
        };
        updatedIngredients[type] = updatedCount;
        const priceAddition = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice + priceAddition;
        this.setState({totalPrice:newPrice, ingredients:updatedIngredients});
        this.updatedPurchaseState(updatedIngredients);
    }

    removeIngredientHandler = (type) =>{
        const oldCount = this.state.ingredients[type];
        if(oldCount <= 0){
            return;
        }
        const updatedCount = oldCount - 1;
        const updatedIngredients ={
            ...this.state.ingredients
        };
        updatedIngredients[type] = updatedCount;
        const priceDeduction = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice - priceDeduction;
        this.setState({totalPrice:newPrice, ingredients:updatedIngredients});
        this.updatedPurchaseState(updatedIngredients);
    }

    render(){
        const disabledInfo = {
            ...this.state.ingredients
        }

        for(let key in disabledInfo){
            disabledInfo[key] = disabledInfo[key] <= 0
        }

        let orderSummary = null;
        let burger = this.state.error ? <p>Error:Ingredients Can't be loaded!</p> : <Spinner />

        if(this.state.ingredients){
            burger = (
                <Aux>
                    <Burger ingredients={this.state.ingredients} />
                    <BuildControls 
                        ingredientAdded={this.addIngredientHandler} 
                        ingredientRemoved={this.removeIngredientHandler} 
                        disabled={disabledInfo} 
                        purchaseable={this.state.purchaseable}
                        price={this.state.totalPrice}
                        ordered={this.purchaseHandler} />
                </Aux>
            );
            orderSummary = <OrderSummary ingredients={this.state.ingredients} purchaseCancelled={this.purchaseCancelHandler} purchaseContinued={this.purchaseContinueHandler} price={this.state.totalPrice} />
        }
        if(this.state.loading){
            orderSummary = <Spinner />
        }

        return(
            <Aux>
                <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
                    {orderSummary}
                </Modal>
                {burger}
            </Aux>
        );
    }
}

export default withErrorHandler(BurgerBuilder,Axios);