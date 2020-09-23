import { v4 as uuidv4 } from 'uuid'
import logger from '../../wobserver.logger'
import { WobserverPlugin } from '../../wobserver.plugins'
import WobserverPC from './wobserver.pc'

class PCManager {
    private pcList: WobserverPC[] = []
    private plugins: WobserverPlugin[] = []

    public addPC(pc: RTCPeerConnection, callId?: string, userId?: string) {
        const curPC = new WobserverPC(uuidv4(), pc, callId, userId)
        this.pcList.push(curPC)
    }

    public removePC(pc: WobserverPC) {
        if (!pc)return
        this.pcList = this.pcList.filter( (currentPC: WobserverPC) => currentPC.getPcId() !== pc.getPcId() )
        pc.dispose()
    }

    public getPCList(): WobserverPC[] {
        return this.pcList
    }

    public attachPlugin(plugin: WobserverPlugin) {
        // if this plugin already attached omit
        if ( this.plugins.find(item => item.id === plugin.id) ) {
            logger.warn('this plugin already attached. omitting re-adding!')
            return
        }
        this.plugins.push(plugin)
    }

    public worker() {
        for (const curPc of this.pcList) {
            curPc.execute(this.plugins).catch(err => logger.error(err))
        }
    }

    public dispose() {
        for (const curPc of this.pcList) {
            curPc?.dispose()
        }
        this.pcList = []
        this.plugins = []
    }
}

export default PCManager
