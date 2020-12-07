const express = require('express')
const axios = require('axios')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const { API_KEY } = require('./config/keys')
var parse = require('parse-duration')

const app = express()


app.use(morgan("dev"))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


app.get('/', async (req, res, next) => {

    res.render('index', {
        videos: undefined
    });

})

app.post('/', async (req, res, next) => {
    const searchQuery = req.body.query
    
    let videoIds = []

    const searchUrl = "https://www.googleapis.com/youtube/v3/search"
    const video_url = 'https://www.googleapis.com/youtube/v3/videos'

    const search_params = {
        key : API_KEY,
        q : searchQuery,
        maxResults : 9,
        part : 'snippet',
        type : 'video'
    }

    await axios.get(searchUrl, {
        params: search_params
    })
        .then(body => {
            const results= body.data['items']
            results.forEach(result => {
                videoIds.push(result['id']['videoId'])
                })
        })
    
    if (req.body.submit == "lucky"){
        return res.redirect(`https://www.youtube.com/watch?v=${ videoIds[0] }`)
    }

    const video_params = {
        key : API_KEY,
        part : 'snippet,contentDetails',
        id : videoIds.join(','),
        maxResult: 9,
    }

    let videos = []
    await axios.get(video_url, {
        params: video_params
    })
        .then(body => {
            const results = body.data['items']
            results.forEach(result => {
                video_data = {
                    id: result['id'],
                    url: `https://www.youtube.com/watch?v=${ result["id"] }`,
                    thumbnail: result['snippet']['thumbnails']['high']['url'],
                    duration: parse(result['contentDetails']['duration']) / 60000,
                    title: result['snippet']['title'],
                }
                videos.push(video_data)
            })
        })
    res.render('index', {
        videos: videos
    });
})



const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`listening on PORT ${PORT}`))