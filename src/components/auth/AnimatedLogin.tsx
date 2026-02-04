
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Stethoscope } from 'lucide-react'

export function AnimatedLogin({ title, description, children, onSubmit, isLoading }) {
  return (
    <div
      className="min-h-screen w-screen bg-black relative overflow-hidden flex items-center justify-center px-4"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 via-blue-900/20 to-black" />
      
      <div className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}
      />

      <motion.div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[100vh] h-[60vh] rounded-b-full bg-cyan-400/10 blur-[80px]"
        animate={{
          opacity: [0.1, 0.2, 0.1],
          scale: [0.98, 1.02, 0.98]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "mirror"
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="relative z-20 w-full max-w-md"
      >
        <div className="relative group">
          <motion.div
            className="absolute -inset-[1px] rounded-2xl"
            animate={{
              boxShadow: [
                "0 0 15px 3px rgba(6, 182, 212, 0.3)",
                "0 0 25px 5px rgba(59, 130, 246, 0.4)",
                "0 0 15px 3px rgba(6, 182, 212, 0.3)"
              ]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "mirror"
            }}
          />

          <div className="absolute -inset-[1px] rounded-2xl overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-[4px] w-[50%] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
              animate={{
                left: ["-50%", "100%"],
                opacity: [0.4, 0.8, 0.4]
              }}
              transition={{
                left: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 },
                opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror" }
              }}
              style={{ filter: "blur(3px)" }}
            />
          </div>

          <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl p-8 border border-cyan-400/20 shadow-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-2 mb-6"
            >
              <div className="mx-auto w-16 h-16 rounded-full border-2 border-cyan-400/30 flex items-center justify-center bg-cyan-500/10">
                <Stethoscope className="w-8 h-8 text-cyan-400" />
              </div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-cyan-400 to-blue-500">
                {title}
              </h1>
              <p className="text-cyan-100/60 text-sm">
                {description}
              </p>
            </motion.div>

            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              onSubmit={onSubmit}
              className="space-y-4"
            >
              {children}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full relative group/button mt-6 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg blur-lg opacity-50 group-hover/button:opacity-75 transition-opacity" />
                <div className="relative bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium h-11 rounded-lg flex items-center justify-center">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    title.includes("Create") ? 'Register' : 'Login'
                  )}
                </div>
              </motion.button>
            </motion.form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
