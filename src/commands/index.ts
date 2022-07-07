import CreateItem from './CreateItem';
import LinkItem from './LinkItem';
import SetDescription from './SetDescription';
import AppendDescription from './AppendDescription';
import SetMetrics from './SetMetrics';
import LinkChannel from './LinkChannel';
import ExplainYourself from './ExplainYourself';
import SyncItem from './SyncItem';

// Exported in an array because downstream the bot will use an array of commands
export default [CreateItem, LinkItem, SetDescription, AppendDescription, SetMetrics, LinkChannel, ExplainYourself, SyncItem];
