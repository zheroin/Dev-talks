const express = require('express');
const router = express.Router()
const { check, validationResult } = require('express-validator')
const auth = require('../../middlewares/auth')

const Post = require('../../models/Post')
const Profile = require('../../models/Profile')
const User = require('../../models//User')


// @ route POST api/posts
// @ desc create a post
// @access private

router.post('/', [auth,
    [
        check('text', 'Text is required').not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({ msg: errors.array() })
    }
    try {
        const user = await User.findById(req.user.id).select('-password')

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        })
        const post = await newPost.save();
        res.status(200).json(post)

    } catch (error) {
        console.log(error.message);
        res.status(500).send("server error")
    }
})

// @ route GET api/posts/all
// @ desc get all posts
// @access private

router.get('/all', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 })
        res.status(200).json(posts)
    } catch (error) {
        console.log(error.message)
        res.status(500).send("server error")

    }
})

// @ route GET api/posts/:id
// @ desc get  post by id
// @access private

router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post)
            return res.status(404).json({ msg: 'Post not found' })

        res.status(200).json(post)
    } catch (error) {
        console.log(error.message)
        if (error.kind === 'ObjectId')
            return res.status(404).json({ msg: 'Post not found' })

        res.status(500).send("server error")

    }
})

// @ route DELETE api/posts/:id
// @ desc delete post by id
// @access private

router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        if (!post)
            return res.status(404).json({ msg: 'Post not found' })

        // check user
        if (post.user.toString() !== req.user.id) {
            return res.status(401).send(" user not authorized; seems like it's not your post")
        }
        await post.remove()
        res.status(200).json({ msg: 'Post removed' })
    } catch (error) {
        console.log(error.message)
        res.status(500).send("server error")

    }
})


// @ route PUT api/posts/:id
// @ desc like a post
// @access private

router.put('/like/:id', auth, async (req, res) => {

    try {
        const post = await Post.findById(req.params.id)

        // check if the post has already been liked
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ msg: 'Post already liked' })
        }
        post.likes.unshift({ user: req.user.id })
        await post.save();
        res.status(200).json(post.likes)
    } catch (error) {
        console.log(error.message)
        res.status(500).send("server error")

    }
})

// @ route PUT api/posts/:id
// @ desc like a post
// @access private

router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        // check if the post has already been liked
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ msg: 'Post has not yet been liked' })
        }
        // get remove index
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id)
        post.likes.splice(removeIndex, 1)

        await post.save();
        res.status(200).json(post.likes)
    } catch (error) {
        console.log(error.message)
        res.status(500).send("server error")
    }
})
// @ route PUT api/posts/comments/:id
// @ desc comment on post
// @access private
router.post('/comments/:id', [auth,
    [
        check('text', 'Text is required').not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({ msg: errors.array() })
    }
    try {
        const user = await User.findById(req.user.id).select('-password')
        const post = await Post.findById(req.params.id)

        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        }
        post.comments.unshift(newComment);
        await post.save();
        res.status(200).json(post.comments)

    } catch (error) {
        console.log(error.message);
        res.status(500).send("server error")
    }
})

// @ route DELETE api/posts/comments/:id/:comment_id
// @ desc delete comment by id
// @ access private

router.delete('/comments/:id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        if (!post)
            return res.status(404).json({ msg: 'post does not exist' })

        // pul out the comment
        const comment = post.comments.find(comment => comment.id === req.params.comment_id)
        // make sure the comment exists
        if (!comment)
            return res.status(404).json({ msg: 'comment does not exist' })

        // check user
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).send(" user not authorized; seems like it's not your post")
        }
        // get remove index
        const removeIndex = post.comments.map(comment => comment.id.toString()).indexOf(req.params.comment_id)
        post.comments.splice(removeIndex, 1)

        await post.save()
        res.status(200).json(post.comments)
    } catch (error) {
        console.log(error.message)
        res.status(500).send("server error")

    }
})







module.exports = router