import { InlineWidget, useCalendlyEventListener } from 'react-calendly';
import { telemetry } from '../lib/telemetry';

interface CalendlyEmbedProps {
  url: string;
  prefill?: {
    name?: string;
    email?: string;
    customAnswers?: Record<string, string>;
  };
}

export function CalendlyEmbed({ url, prefill }: CalendlyEmbedProps) {
  useCalendlyEventListener({
    onEventScheduled: (e) => {
      telemetry.track({
        type: 'widget.calendly.scheduled',
        metadata: {
          eventUri: e.data.payload.event?.uri,
          inviteeUri: e.data.payload.invitee?.uri,
        },
      });
    },
    onDateAndTimeSelected: () => {
      telemetry.track({
        type: 'widget.calendly.date_selected',
        metadata: {},
      });
    },
  });

  return (
    <div
      className="exactly-calendly-embed"
      style={{
        width: '100%',
        minHeight: '500px',
        marginTop: '8px',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <InlineWidget
        url={url}
        prefill={prefill}
        styles={{
          height: '500px',
          width: '100%',
        }}
      />
    </div>
  );
}
