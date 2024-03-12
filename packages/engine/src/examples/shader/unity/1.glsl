vec3 WorldSpaceViewDir( vec4 v )
{
    return _WorldSpaceCameraPos.xyz - (unity_ObjectToWorld * v).xyz;
}