const express = require('express');
const router = express.Router();
const User = require('../user');

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})

// get all users
router.get('/', async (req, res) => {
    try {
        const { email } = req.query;
        console.log('email:', email)
        if (email) {
            const user = await User.findOne({ email });
            res.json(user);
        } else {
            const users = await User.find();
            
            res.json(users);
            // connection.db.collection('users', async (err, collection) => {
            //     console.log('get collection');
            //     if (err) console.log(err);
            //     const users = await collection.find().toArray()
            //     console.dir(users);
            //     res.json(users);
            // });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// get user by id
router.get('/:id', getUser, (req, res) => {
    res.json(res.user);
});

// create new user
router.post('/', async (req, res) => {
    const { username, password, confirmPassword, email } = req.body;
    if (username && password && confirmPassword && email && password === confirmPassword) {
        try {
            const user = new User({
                username,
                password,
                email
            });
            const newUser = await user.save();
            res.status(201).json(newUser);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    } else res.status(400).json({ message: 'The password and confirm password fields do not match.'});
});

router.patch('/:id', getUser, async (req, res) => {
    if (req.body.name != null) {
        res.user.name = req.body.name;
    } try {
        const updatedUser = await res.user.save();
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
});

router.delete('/all', async (req, res) => {
    try {
        await User.deleteMany();
        res.status(200).send('All users at origin location have been deleted');
    } catch (err) {
        res.status(500).json({ message: err.message});
    }
});

router.delete('/:id', getUser, async (req, res) => {
    try {
        await res.user.remove();
        res.json({ message: 'Deleted User' });
    } catch (err) {
        res.status(500).json({ message: err.message});
    }
});

async function getUser(req, res, next) {
    let user;
    try {
        user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Cannot find user'});
        }
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
    res.user = user;
    next();
}

module.exports = router;