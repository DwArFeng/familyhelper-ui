import { type Component, defineComponent, h } from 'vue'

import PlaceholderPanel from '@/components/comvisual/layout/placeholderPanel/PlaceholderPanel.vue'
import BorderLayoutPanel from '@/components/elementPlus/layout/borderLayoutPanel/BorderLayoutPanel.vue'

import styles from './index.module.css'

export function placeholder(placeholder: string): Component {
  return defineComponent({
    name: 'PlaceholderComponent',
    setup() {
      return () =>
        h('div', { class: styles['placeholder-container'] }, [
          h(
            BorderLayoutPanel,
            {},
            {
              default: () => h(PlaceholderPanel, { text: placeholder }),
            },
          ),
        ])
    },
  })
}
