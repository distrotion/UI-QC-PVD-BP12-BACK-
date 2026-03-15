const axios = require('axios')

const instance = axios.create({
  timeout: 30000
})

exports.post = async (url, body) => {
  try {
    const res = await instance.post(url, body)
    return res.data
  } catch (error) {
    const status = error.response ? error.response.status : 503
    console.error(`POST ${url} error: ${status}`)
    return status
  }
}

exports.get = async (url) => {
  try {
    const res = await instance.get(url)
    return res.data
  } catch (error) {
    const status = error.response ? error.response.status : 503
    console.error(`GET ${url} error: ${status}`)
    return status
  }
}
