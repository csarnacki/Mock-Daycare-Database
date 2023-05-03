//Handles the routes which return HTML content to the client, based on the route that the client requests.

// Import the necessary libraries and middleware
const router = require('express').Router();
const { Child, Allergy } = require('../models');
const withAuth = require('../utils/auth');

// Route for homepage
// Test in web browser: http://localhost:3001/
router.get('/', (req, res) => {
    res.render('homepage', { layout: 'main', loggedIn: req.session.logged_in });
});

// Route for login page
// Test in web browser: http://localhost:3001/login
router.get('/login', (req, res) => {
    if (req.session.logged_in) {
        res.redirect('/dashboard');
        return;
    }
    res.render('login', { layout: 'main' });
});

// Route for dashboard
// Test in web browser:  http://localhost:3001/dashboard
router.get('/dashboard', withAuth, async (req, res) => {
    try {
      const user = await User.findByPk(req.session.user_id, {
        include: [{ model: Child }],
      });
      // Serialize the data so the template can read it
      const children = user.children.map((child) => child.get({ plain: true }));
  
      res.render('children', { layout: 'main', children, loggedIn: true });
    } catch (err) {
      res.status(500).json(err);
    }
});

// Route to view child's profile after select name in dashboard
// Test in web browser: http://localhost:3001/child/{child_id}
router.get('/child/:id', withAuth, async (req, res) => {
    try {
        const child = await Child.findByPk(req.params.id, {
            include: [
            {
                model: Allergy,
                through: { attributes: [] },
            },
            ],
        });
  
        const childPlain = child.get({ plain: true });
        childPlain.allergies = childPlain.allergies.map((allergy) => allergy.name);
  
        res.render('child', { layout: 'main', child: childPlain, loggedIn: true });
    } catch (err) {
        res.status(500).json(err);
    }
});

