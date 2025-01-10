const express = require('express');
const { default: mongoose } = require('mongoose');
const app = express();
const mongoos = require('mongoose');


// const hostName = '127.1.2.0';
const PORT = 20000;
//create schema funcation.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const productsScehma = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Product Title is required..."],
        minLength: [3, "Minumum length of the product title.."],
        mixLegnth: [100, "Maxmum lenthe of the product title.."],
        // upperCase: [true],
        // lowerCase: [true],
        trim: true,
        // enum: {
        //     values: ["iphone, samsung"],
        //     message: '{VALUE} is not supported'
        // },

        // validate: {
        //     validator: function(v) {
        //         return v.length === 10;       // validate method..........
        //     },
        //     message: (props) => `${props.value} is not validate funcation title`

        // },
    },
    Price: {
        type: Number,
        required: true,
        min: [1000, 'Products is normal price is 1000 Tk..'],
        max: [20000, ' the maximum price of the products '],
    },
    rating: {
        type: Number,
        required: [true, "Product rating is required..."],
        minLength: 3,
    },
    // email: {
    //     type: String,
    //     unique: true,
    // },
    Description: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: [true, 'Place is a phone number......'],
        validate: {
            validator: function(k) {
                const phoneValidate = / \d { 3 } - \d { 3 } - \d { 4 } /;
                return phoneValidate.test(k);

            },
            message: (props) => `${props.value} is can not valid phone number..`
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },

});


//create model funcation.
const product = mongoose.model('products', productsScehma);

/*mongoos.connect('mongodb://127.0.0.1:27017/mongodbFirstProject')
.then(() => console.log("Database is conected"))
.catch((error) => {
console.log('Database Is Not Conected..')
console.log(error)
process.exit(1);    // Database is connecting setup ...............##
});
*/

/* Async/await */
const DatabaseAsyncAwait = async() => {
    try {
        await mongoos.connect('mongodb://127.0.0.1:27017/mongodbFirstProject')
        console.log("Server is running bappy...");

    } catch (error) {
        console.log("server is Not Connected..");
        console.log(error);
        process.exit(1);
    }

};

app.get("/", (req, res) => {
    res.send(`my server`);
})

app.post("/products", async(req, res) => {
    try {
        /*  //get data from request body... amra data gulo pete pari..
       const title = req.body.title;
        const Price = req.body.Price;    
        const Description = req.body.Description;*/
        const newProduct = new product({
            title: req.body.title,
            Price: req.body.Price,
            rating: req.body.rating,
            Description: req.body.Description,
            phone: req.body.phone,
        });

        const productData = await newProduct.save({});
        /*  const productData = await product.insertMany([{
            "title": "iPhon8",
            "Price": 9000,
            "Description": "Good phone",
                  
        }, {
            "title": "iPhone9",
            "Price": 100000,
            "Description": "very very good phone",//insertMany function
        }, ]);
*/
        // res.status(200).send({ title, Price, Description });
        res.status(200).send({ productData });
    } catch (error) {
        res.status(300).send({ messages: error.messages });
    }
});

//all products............................................................?

// { $or:[{ Price: { $gt: Price } }, { ratung: { $gt: 4 } }] }
app.get("/products", async(req, res) => {
    try {
        /*   const Price = req.query.Price;
           const products = await product.find({ Price: { $gt: Price } });*/
        const Price = req.query.Price;
        const rating = req.query.rating;
        let products;
        if (Price && rating) {
            products = await product.find({
                // $or: [{ Price: { $gt: 500 } }, { ratung: { $gt: 4 } }], ----- OR
                // $and: [{ Price: { $gt: 9000 } }, { ratung: { $gt: 4 } }],---- and
                $or: [{ Price: { $gt: Price } }, { ratung: { $gt: rating } }], // NOR
            });
            //     }).sort({ Price: -1 }).select({ title: 1, Price: 1 });
            // } else {          //document count, sort and select...........
            //     products = await product.find().sort({ Price: -1 }).select({ title: 1, Price: 1 });
            // }

        } else {
            products = await product.find();
        }
        if (products) {
            res.status(200).send({
                success: true,
                messages: "return All products",
                data: products,
            });

        } else {
            res.status(404).send({
                success: false,
                messages: " 404 is Not Found.."
            });
        }

    } catch (error) {
        res.status(200).send({ messages: error.messages });
    }

})

app.listen(PORT, async() => {
    console.log(`My Server IS Running: http://localhost:${PORT}`);
    await DatabaseAsyncAwait();
});

// get query id definision 
// single product......................
app.get("/products/:id", async(req, res) => {
    try {
        const id = req.params.id;
        // const product = await product.findOne({ _id: id });
        const product = await product.findIdAndDelete({ _id: id });
        if (product) {
            res.status(200).send({
                success: true,
                messages: "return single product",
                data: product,
            });

        } else {
            res.status(404).send({
                success: false,
                messages: " 404 is Not Found.."
            });
        }

    } catch (error) {
        res.status(400).send({ messages: error.messages });
    }

});


app.delete("products/:id", async(req, res) => {
    try {
        const id = req.params.id;
        const DeleteProducts = await product.deleteOne({ _id: id });

        if (DeleteProducts) {
            res.status(202).send({
                success: true,
                messages: "Delete  single product name",
                data: DeleteProducts,
            });

        } else {
            res.status(404).send({
                success: false,
                messages: " 404 delete is Not Found.."
            });
        }
    } catch (error) {
        res.status(4004).send({ messages: error.messages });
    }
});
// update in mongodb function........
app.put("/products/:id", async(req, res) => {
    try {
        const id = req.params.id;
        const updateProduct = await product.findByIdAndUpdate({ _id: id }, {
            $set: {
                title: req.body.title,
                Description: req.body.Description,
                Price: req.body.Price,
                rating: req.body.rating,
            },


        }, {
            new: true
        });
        if (updateProduct) {
            res.status(202).send({
                success: true,
                messages: "The Product is Update Now",
                data: updateProduct,
            });

        } else {
            res.status(404).send({
                success: false,
                messages: " 404 Product is Not Found.."
            });
        }


    } catch (error) {
        res.status(203).send({
            messages: error.messages
        });


    }

})