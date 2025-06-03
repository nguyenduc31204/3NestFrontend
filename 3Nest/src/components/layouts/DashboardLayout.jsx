import React from 'react'
import { UserContext } from '../../context/userContext'
import SideMenu from './SideMenu'
import Navbar from './Navbar'

const DasboardLayout = ({children, activeMenu}) => {

  return (
    <div>
      <Navbar activeMenu={activeMenu} />
        <div className='flex'>
            <div className='max-[1080px]:hidden '>
                <SideMenu activeMenu={activeMenu} />
            </div>

            <div className='grow mx-5'>{children}</div>
        </div>
    </div>
  )
}

export default DasboardLayout
