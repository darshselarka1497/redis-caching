const express = require ('express')
const axios = require('axios')
const redis = require('redis')
const responseTime = require('response-time')
const {promisify} = require('util')

const app = express()

app.use(responseTime())

const client = redis.createClient()

const GET_ASYNC = promisify(client.get).bind(client)

const SET_ASYNC = promisify(client.set).bind(client)

app.get('/rockets', async(req,res,next) => {
    try{
        const reply = await GET_ASYNC('rockets')
        if(reply){
            console.log('Using Cached data')
            res.send(JSON.parse(reply))
            return
        }
        const response = await axios.get('https://api.spacexdata.com/v3/rockets')
        const saveResponse = await SET_ASYNC('rockets', JSON.stringify(response.data), 'EX', 20) // caching for 20 seconds
        console.log('New Response cached', saveResponse)
        res.send(response.data)
    }catch(error){
        res.send(error.message)
    }
})
app.listen(3000, () => console.log('Houston, we are live on 3000!'))

