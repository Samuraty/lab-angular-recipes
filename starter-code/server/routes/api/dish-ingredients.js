const express    = require('express');
const mongoose   = require('mongoose');
const ObjectId   = mongoose.Schema.Types.ObjectId;
const router     = express.Router();
const Ingredient = require('../../models/ingredient');
const Dish       = require('../../models/dish');

router.post('/dishes/:dishId/ingredients/:id/add', (req, res) => {
  const { dishId, id } = req.params;
  let { quantity } = req.body;
  quantity = Number(quantity);

  Dish
    .findById(dishId)
    .populate('ingredients.ingredientId')
    .exec(
     (err, dish) => {
      if (err)    { return res.status(500).json(err) };
      if (!dish)  { return res.status(404).json(new Error('404')) };

      let possibleIngred = dish.ingredients.filter(ingred => {
         return ingred.ingredientId._id.toString() === id;
      })[0];

      if (possibleIngred){
        possibleIngred.quantity += quantity;
      } else {
        possibleIngred = { ingredientId: id, quantity: quantity }
        //dish.ingredients.push(possibleIngred);
        dish.ingredients.unshift(possibleIngred);  //no entiendo por que hay que poner esto sino da 500 internal server error 
      }


      dish.save( (err) => {
        if (err) { return res.status(500).json(err) }

        Ingredient.findById(id, (err, ingredient) => {
          if (err) { return res.status(500).json(err) }

          const lastIndex = dish.ingredients.length - 1;
          dish.ingredients[lastIndex].ingredientId = ingredient;

          return res.status(200).json(dish);
        });
      });
    });
});

module.exports = router;
