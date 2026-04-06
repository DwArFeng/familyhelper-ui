import { type Component, defineComponent, h } from 'vue'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import RootBorderLayoutPanel from '@/components/elementPlus/layout/rootBorderLayoutPanel/RootBorderLayoutPanel.vue'

import styles from './index.module.css'

export function placeholder(placeholder: string): Component {
  return defineComponent({
    name: 'PlaceholderComponent',
    setup() {
      return () =>
        h('div', { class: styles['placeholder-container'] }, [
          h(
            RootBorderLayoutPanel,
            {
              initialDockStatus: 4,
              initialFloatyY: -200,
            },
            {
              default: () => h(PlaceholderPanel, { text: placeholder }),
            },
          ),
        ])
    },
  })
}
