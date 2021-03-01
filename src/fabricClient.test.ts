import { FabricClient } from "./fabricClient"
import { readFileSync } from 'fs'

it('test connect',async () => {
    const ccp = JSON.parse(readFileSync('config/profile.json').toString())
    const identity = JSON.parse(readFileSync('config/wallet/gmyx.id').toString())
    const client = new FabricClient()
    await client.init({ 
        username: 'gmyx',
        ccp,
        channelID: 'mychannel',
        identity
    })

    const response = await client.evaluate('InitiateUserProfile', '233')
    console.log(response?.toString())
})