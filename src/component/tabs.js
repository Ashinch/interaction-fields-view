import { useRef, useState } from 'react'

const Tabs = ({names, selected, onSelected}) => {
  const [select, setSelected] = useState(selected || 0)
  const scrollView = useRef()
  return (
    <div className="scroll-list" ref={scrollView}>
      {names?.map((item, index) => {
        return (
          <div
            key={index}
            className="item"
            style={select === index ? {borderBottom: "2px solid black"} : {}}
            onClick={() => {
              setSelected(index)
              let i = 0
              let timer = setInterval(() => {
                // scrollLeft += 55
                scrollView.current.scrollLeft += index > 1 ? 2.75 : 0
                if (++i >= 20) clearInterval(timer)
              }, 10)
              onSelected?.(index)
            }}
          >
            <p style={{color: select === index ? "black" : "gray"}}>
              {item}
            </p>
          </div>
        )
      })}

      <style jsx="true">{`
        .scroll-list {
          display: flex;
          flex-wrap: nowrap;
          overflow-y: scroll;
        }

        .scroll-list::-webkit-scrollbar {
          display: none;
        }

        .item {
          flex-shrink: 0;
          padding: 3px 4px 3px 4px;
          cursor: pointer;
          user-select: none;
        }

        .item p {
          font-size: 14px;
          transition-duration: .1s;
          transition-property: all;
          transition-timing-function: linear;
        }

        .item:hover p {
          color: black;
        }


      `}</style>
    </div>
  )
}

export default Tabs
