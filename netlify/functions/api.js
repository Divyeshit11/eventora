import serverless from 'serverless-http'
import serverModule from '../../server/server.js'

const { app, initializeApp } = serverModule

const expressHandler = serverless(app)

export async function handler(event, context) {
    await initializeApp()
    return expressHandler(event, context)
}
