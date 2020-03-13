/**
 * @description url控制台
 * @author xinghua.wen
 */
import Login from './modules/login.url'
import Console from './modules/console.url'
import Iass from './modules/iass.url'
import Metadata from './modules/metadata.url'
import Billing from './modules/Billing.url'
import System from './modules/system.url'
import OperMgmt from './modules/operMgmt.url'
import PortalUrl from './modules/portal.url'
import Stats from './modules/stats.url'
import BmpUrl from './modules/bmp.url'
import Ticket from './modules/ticket.url'
import Statis from './modules/statis.url'
import Monitor from './modules/Monitor.url'
import Bastion from './modules/bastion.url'
import userCenter from './modules/userCenter.url'
import citrixDesk from './modules/citrixDesk.url'
import appMgmt from './modules/appMgmt.url'
import vcops from './modules/vcops.url'

const urlObj = Object.assign({}, Login, Console, Iass, Metadata, Billing, System, OperMgmt, PortalUrl, BmpUrl, Stats, Statis, Monitor, Ticket, Bastion, userCenter, citrixDesk, appMgmt, vcops)

export default urlObj
