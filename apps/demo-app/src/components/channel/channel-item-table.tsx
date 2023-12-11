import moment from "moment";

import { Input } from "@nextui-org/input";

import { withCommands } from "@infinigrow/commander/with-commands";
import { useCommanderState } from "@infinigrow/commander/use-commands";

import { formatNumericStringToFraction } from "@infinigrow/demo-app/src/utils";

import { DEFAULT_CHANNEL_BREAK_INPUT_PROPS } from "@infinigrow/demo-app/src/components/channel/channel-constants";

import "@infinigrow/demo-app/src/components/channel/_channel-item-table.scss";

import type { ChannelItemProps, ChannelState } from "@infinigrow/demo-app/src/components/channel/channel-types";

import type { CommandFunctionComponent } from "@infinigrow/commander/types";

import type { InputProps} from "@nextui-org/input";

export const ChannelItemTable: CommandFunctionComponent<ChannelItemProps, ChannelState> = ( props, initialState ) => {
    const [ getState ] = useCommanderState<ChannelState>( "App/ChannelItem", initialState );

    const state = getState();

    return (
        <div className="channel-item-table">
            <div className="channel-item-table-breaks">
                { state.breaks!.map( ( budgetBreak, index ) => {
                    return (
                        <div key={ index } className="channel-item-table-date">
                            <>{ moment( budgetBreak.date ).format( "MMM D" ) }</>
                        </div>
                    );
                } ) }
                { state.breaks!.map( ( budgetBreak, index ) => {
                    const inputProps: InputProps = {
                        ... DEFAULT_CHANNEL_BREAK_INPUT_PROPS,

                        variant: "flat",

                        disabled: true,

                        value: formatNumericStringToFraction( budgetBreak.value ),
                    };

                    return (
                        <div key={ index } className="channel-item-table-budget">
                            <Input { ... inputProps } />
                        </div>
                    );
                } ) }
            </div>
        </div>
    );
};

const $$ = withCommands<ChannelItemProps, ChannelState>( "App/ChannelItem", ChannelItemTable, {
        frequency: "annually",
        baseline: "0",
        allocation: "equal",
        breaks: []
    }, []
);

export default $$;
