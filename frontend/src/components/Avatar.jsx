import React, {useEffect, useRef, useState} from 'react'
import {useGraph, useFrame} from '@react-three/fiber'
import {useAnimations, useFBX, useGLTF} from '@react-three/drei'
import {SkeletonUtils} from 'three-stdlib'
import * as THREE from 'three'

export function Avatar({ animation: externalAnimation, ...props }) {
  const { scene } = useGLTF('/models/67c6f790f92092108ae1bbaf.glb')
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes, materials } = useGraph(clone)

  const group = useRef()
  const teethRef = useRef()
  const headRef = useRef()

  const [isTalking, setIsTalking] = useState(false)

  const mouthTimer = useRef(0)

  const { animations: idleAnimation } = useFBX("/animations/Idle.fbx")
  const { animations: talkingAnimation } = useFBX("/animations/Talking.fbx")
  const { animations: macarenaDanceAnimation } = useFBX("/animations/Macarena Dance.fbx")

  idleAnimation[0].name = "Idle"
  talkingAnimation[0].name = "Talking"
  macarenaDanceAnimation[0].name = "Macarena Dance"

  const [animation, setAnimation] = useState("Idle")

  useEffect(() => {
    if (externalAnimation) {
      setAnimation(externalAnimation)
      setIsTalking(externalAnimation === "Talking")
    }
  }, [externalAnimation])

  const processedAnimations = React.useMemo(() => {
    return [idleAnimation[0], talkingAnimation[0], macarenaDanceAnimation[0]].map(anim => {
      const clip = THREE.AnimationClip.parse(THREE.AnimationClip.toJSON(anim))

      clip.tracks.forEach(track => {
        track.name = track.name.replace(/^mixamorig\./, "")
        track.name = track.name.replace(/^Armature/, "Hips")
      })

      return clip
    })
  }, [idleAnimation, talkingAnimation, macarenaDanceAnimation])

  const { actions } = useAnimations(processedAnimations, group)

  useEffect(() => {
    if (nodes.Wolf3D_Teeth && nodes.Wolf3D_Teeth.morphTargetDictionary) {
      console.log("Teeth morphs:", nodes.Wolf3D_Teeth.morphTargetDictionary)
    }
    if (nodes.Wolf3D_Head && nodes.Wolf3D_Head.morphTargetDictionary) {
      console.log("Head morphs:", nodes.Wolf3D_Head.morphTargetDictionary)
    }

    if (actions[animation]) {
      actions[animation].reset().fadeIn(0.5).play()
      return () => actions[animation] && actions[animation].fadeOut(0.5)
    } else {
      console.error(`Animation "${animation}" not found in available actions:`, actions)
    }
  }, [animation, actions, nodes])

  useFrame((state, delta) => {
    if (isTalking) {
      if (teethRef.current && teethRef.current.morphTargetDictionary && teethRef.current.morphTargetInfluences) {
        const mouthOpenIndex = teethRef.current.morphTargetDictionary["mouthOpen"]

        if (mouthOpenIndex !== undefined) {
          mouthTimer.current += delta * 8

          const openAmount = Math.abs(Math.sin(mouthTimer.current)) * 0.8

          teethRef.current.morphTargetInfluences[mouthOpenIndex] = openAmount

          if (headRef.current &&
            headRef.current.morphTargetDictionary &&
            headRef.current.morphTargetInfluences &&
            headRef.current.morphTargetDictionary["mouthOpen"] !== undefined) {
            const headMouthOpenIndex = headRef.current.morphTargetDictionary["mouthOpen"]
            headRef.current.morphTargetInfluences[headMouthOpenIndex] = openAmount
          }
        }
      }
    } else {
      if (teethRef.current &&
        teethRef.current.morphTargetDictionary &&
        teethRef.current.morphTargetInfluences) {
        const mouthOpenIndex = teethRef.current.morphTargetDictionary["mouthOpen"]

        if (mouthOpenIndex !== undefined) {
          teethRef.current.morphTargetInfluences[mouthOpenIndex] = 0
        }
      }

      if (headRef.current &&
        headRef.current.morphTargetDictionary &&
        headRef.current.morphTargetInfluences &&
        headRef.current.morphTargetDictionary["mouthOpen"] !== undefined) {
        const headMouthOpenIndex = headRef.current.morphTargetDictionary["mouthOpen"]
        headRef.current.morphTargetInfluences[headMouthOpenIndex] = 0
      }
    }
  })

  return (
    <group {...props} dispose={null} ref={group}>
      <primitive object={nodes.Hips} />
      <skinnedMesh geometry={nodes.Wolf3D_Hair.geometry} material={materials.Wolf3D_Hair} skeleton={nodes.Wolf3D_Hair.skeleton} />
      <skinnedMesh geometry={nodes.Wolf3D_Body.geometry} material={materials.Wolf3D_Body} skeleton={nodes.Wolf3D_Body.skeleton} />
      <skinnedMesh geometry={nodes.Wolf3D_Outfit_Bottom.geometry} material={materials.Wolf3D_Outfit_Bottom} skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton} />
      <skinnedMesh geometry={nodes.Wolf3D_Outfit_Footwear.geometry} material={materials.Wolf3D_Outfit_Footwear} skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton} />
      <skinnedMesh geometry={nodes.Wolf3D_Outfit_Top.geometry} material={materials.Wolf3D_Outfit_Top} skeleton={nodes.Wolf3D_Outfit_Top.skeleton} />
      <skinnedMesh name="EyeLeft" geometry={nodes.EyeLeft.geometry} material={materials.Wolf3D_Eye} skeleton={nodes.EyeLeft.skeleton} morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary} morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences} />
      <skinnedMesh name="EyeRight" geometry={nodes.EyeRight.geometry} material={materials.Wolf3D_Eye} skeleton={nodes.EyeRight.skeleton} morphTargetDictionary={nodes.EyeRight.morphTargetDictionary} morphTargetInfluences={nodes.EyeRight.morphTargetInfluences} />
      <skinnedMesh
        name="Wolf3D_Head"
        ref={headRef}
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        ref={teethRef}
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
    </group>
  )
}

useGLTF.preload('/models/67c6f790f92092108ae1bbaf.glb')