import 'package:flutter/material.dart';

const TextTheme textTheme = TextTheme(
  titleLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.w500),
  labelLarge: TextStyle(fontSize: 24, fontWeight: FontWeight.w500),
  //
  labelMedium: TextStyle(fontSize: 22, fontWeight: FontWeight.w400),
  bodyMedium: TextStyle(fontSize: 18),
);

ButtonStyle elevationButtonStyle(Color mainColor, Color textColor) => ButtonStyle(
      textStyle: WidgetStateProperty.all<TextStyle>(
        const TextStyle(fontSize: 20),
      ),
      foregroundColor: WidgetStateProperty.all<Color>(textColor),
      backgroundColor: WidgetStateProperty.all<Color>(mainColor),
      padding: WidgetStateProperty.all<EdgeInsetsGeometry>(
        const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      ),
      shape: WidgetStateProperty.all<RoundedRectangleBorder>(
        RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
        ),
      ),
    );

InputDecorationTheme inputDecoration(Color? mainColor) => InputDecorationTheme(
      prefixIconColor: mainColor,
      suffixIconColor: mainColor,
      labelStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.w500),
      enabledBorder: UnderlineInputBorder(
        borderSide: BorderSide(color: mainColor!),
      ),
      focusedBorder: UnderlineInputBorder(
        borderSide: BorderSide(
          color: mainColor,
        ),
      ),
    );

ThemeData lightTheme = ThemeData(
  appBarTheme: const AppBarTheme(
    color: Color.fromRGBO(235, 231, 227, 1),
    centerTitle: true,
  ),
  colorScheme: ColorScheme.fromSwatch(
    primarySwatch: Colors.orange,
    accentColor: Colors.orangeAccent,
    cardColor: const Color.fromRGBO(215, 215, 215, 0.9),
    backgroundColor: const Color.fromRGBO(235, 231, 227, 1),
    brightness: Brightness.light,
  ),
  inputDecorationTheme: inputDecoration(Colors.black),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: elevationButtonStyle(Colors.orange, Colors.black),
  ),
  textTheme: textTheme,
);
